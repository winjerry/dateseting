import { and, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import { db } from '@/core/db';
import { participant, participantChoice, matchResult, event } from '@/config/db/schema';

// =========================================
// Types
// =========================================

export type Participant = typeof participant.$inferSelect;
export type NewParticipant = typeof participant.$inferInsert;
export type UpdateParticipant = Partial<Omit<NewParticipant, 'id' | 'createdAt'>>;

export type ParticipantChoice = typeof participantChoice.$inferSelect;
export type NewParticipantChoice = typeof participantChoice.$inferInsert;

export type MatchResult = typeof matchResult.$inferSelect;
export type NewMatchResult = typeof matchResult.$inferInsert;

export enum ParticipantStatus {
  REGISTERED = 'registered', // 已注册
  ATTENDED = 'attended',     // 已参加
  CANCELLED = 'cancelled',   // 已取消
}

export enum RegistrationSource {
  QR_CODE = 'qr_code',
  LINK = 'link',
}

// =========================================
// Participant CRUD Operations
// =========================================

/**
 * 生成选择Token
 */
export function generateChoiceToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export type CreateParticipantInput = Omit<NewParticipant, 'id' | 'choiceToken' | 'choiceTokenExpiresAt' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

/**
 * 创建参与者
 */
export async function createParticipant(newParticipant: CreateParticipantInput): Promise<Participant> {
  const id = uuidv4();
  const choiceToken = generateChoiceToken();
  const choiceTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期
  
  const [result] = await db()
    .insert(participant)
    .values({
      ...newParticipant,
      id,
      choiceToken,
      choiceTokenExpiresAt,
    })
    .returning();

  return result;
}

export async function refreshParticipantChoiceToken(
  participantId: string
): Promise<Participant | undefined> {
  const choiceToken = generateChoiceToken();
  const choiceTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [result] = await db()
    .update(participant)
    .set({
      choiceToken,
      choiceTokenExpiresAt,
    })
    .where(eq(participant.id, participantId))
    .returning();

  return result;
}

export async function registerParticipantForEvent(
  eventId: string,
  newParticipant: CreateParticipantInput
): Promise<Participant> {
  return db().transaction(async (tx) => {
    const [existingParticipant] = await tx
      .select()
      .from(participant)
      .where(
        and(
          eq(participant.eventId, eventId),
          eq(participant.email, newParticipant.email)
        )
      );

    if (existingParticipant) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const [capacityUpdate] = await tx
      .update(event)
      .set({
        currentParticipants: sql`${event.currentParticipants} + 1`,
      })
      .where(
        and(
          eq(event.id, eventId),
          sql`${event.currentParticipants} < ${event.capacity}`
        )
      )
      .returning({ id: event.id });

    if (!capacityUpdate) {
      throw new Error('EVENT_FULL');
    }

    const id = uuidv4();
    const choiceToken = generateChoiceToken();
    const choiceTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [createdParticipant] = await tx
      .insert(participant)
      .values({
        ...newParticipant,
        id,
        choiceToken,
        choiceTokenExpiresAt,
      })
      .returning();

    return createdParticipant;
  });
}

/**
 * 获取活动的参与者列表
 */
export async function getParticipantsByEventId(
  eventId: string,
  {
    status,
    page = 1,
    limit = 100,
  }: {
    status?: ParticipantStatus;
    page?: number;
    limit?: number;
  } = {}
): Promise<Participant[]> {
  const result = await db()
    .select()
    .from(participant)
    .where(
      and(
        eq(participant.eventId, eventId),
        status ? eq(participant.status, status) : undefined
      )
    )
    .orderBy(desc(participant.registeredAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

/**
 * 获取活动参与者数量
 */
export async function getParticipantsCount(eventId: string): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(participant)
    .where(eq(participant.eventId, eventId));

  return result?.count || 0;
}

/**
 * 通过ID查找参与者
 */
export async function findParticipantById(id: string): Promise<Participant | undefined> {
  const [result] = await db()
    .select()
    .from(participant)
    .where(eq(participant.id, id));

  return result;
}

/**
 * 通过Token查找参与者
 */
export async function findParticipantByToken(token: string): Promise<Participant | undefined> {
  const [result] = await db()
    .select()
    .from(participant)
    .where(eq(participant.choiceToken, token));

  return result;
}

/**
 * 通过邮箱和活动ID查找参与者
 */
export async function findParticipantByEmailAndEventId(
  eventId: string,
  email: string
): Promise<Participant | undefined> {
  const [result] = await db()
    .select()
    .from(participant)
    .where(
      and(
        eq(participant.eventId, eventId),
        eq(participant.email, email)
      )
    );

  return result;
}

/**
 * 检查邮箱是否已注册该活动
 */
export async function isEmailRegisteredForEvent(
  eventId: string,
  email: string
): Promise<boolean> {
  const [result] = await db()
    .select({ count: count() })
    .from(participant)
    .where(
      and(
        eq(participant.eventId, eventId),
        eq(participant.email, email)
      )
    );

  return (result?.count || 0) > 0;
}

/**
 * 更新参与者
 */
export async function updateParticipant(
  id: string,
  updateData: UpdateParticipant
): Promise<Participant | undefined> {
  const [result] = await db()
    .update(participant)
    .set(updateData)
    .where(eq(participant.id, id))
    .returning();

  return result;
}

// =========================================
// Choice Operations
// =========================================

/**
 * 提交参与者选择
 */
export async function submitParticipantChoices(
  participantId: string,
  eventId: string,
  targetParticipantIds: string[]
): Promise<void> {
  await db().transaction(async (tx) => {
    // 删除之前的选择（如果有）
    await tx
      .delete(participantChoice)
      .where(eq(participantChoice.participantId, participantId));

    // 插入新选择
    if (targetParticipantIds.length > 0) {
      const choices = targetParticipantIds.map((targetId) => ({
        id: uuidv4(),
        eventId,
        participantId,
        targetParticipantId: targetId,
        isInterested: true,
      }));

      await tx.insert(participantChoice).values(choices);
    }

    // 更新参与者状态
    await tx
      .update(participant)
      .set({
        hasSubmittedChoices: true,
        choicesSubmittedAt: new Date(),
      })
      .where(eq(participant.id, participantId));
  });
}

/**
 * 获取参与者的选择
 */
export async function getParticipantChoices(participantId: string): Promise<string[]> {
  const choices = await db()
    .select({ targetId: participantChoice.targetParticipantId })
    .from(participantChoice)
    .where(eq(participantChoice.participantId, participantId));

  return choices.map((c) => c.targetId);
}

// =========================================
// Matching Operations
// =========================================

/**
 * 计算活动的匹配结果
 */
export async function calculateMatches(eventId: string): Promise<MatchResult[]> {
  // 获取所有选择
  const allChoices = await db()
    .select()
    .from(participantChoice)
    .where(eq(participantChoice.eventId, eventId));

  // 构建选择映射
  const choiceMap = new Map<string, Set<string>>();
  for (const choice of allChoices) {
    if (!choiceMap.has(choice.participantId)) {
      choiceMap.set(choice.participantId, new Set());
    }
    choiceMap.get(choice.participantId)!.add(choice.targetParticipantId);
  }

  // 查找互相选择的配对
  const matches: NewMatchResult[] = [];
  const processedPairs = new Set<string>();

  // 获取现有的匹配结果，避免重复插入
  const existingMatches = await db()
    .select()
    .from(matchResult)
    .where(eq(matchResult.eventId, eventId));
    
  const existingPairs = new Set<string>();
  for (const m of existingMatches) {
    const pairKey = [m.participant1Id, m.participant2Id].sort().join('-');
    existingPairs.add(pairKey);
  }

  for (const [participantA, choicesA] of choiceMap) {
    for (const participantB of choicesA) {
      // 检查是否已处理过这对 (当前运行中)
      const pairKey = [participantA, participantB].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      // 检查是否已存在于数据库
      if (existingPairs.has(pairKey)) continue;

      // 检查是否互相选择
      const choicesB = choiceMap.get(participantB);
      if (choicesB && choicesB.has(participantA)) {
        matches.push({
          id: uuidv4(),
          eventId,
          participant1Id: participantA,
          participant2Id: participantB,
          matchedAt: new Date(),
          isNotified: false,
        });
      }
    }
  }

  // 保存新发现的匹配结果
  if (matches.length > 0) {
    await db().insert(matchResult).values(matches);
  }

  // 更新活动状态
  await db()
    .update(event)
    .set({
      isMatchingCompleted: true,
      matchingCompletedAt: new Date(),
    })
    .where(eq(event.id, eventId));

  // 返回匹配结果
  const results = await db()
    .select()
    .from(matchResult)
    .where(eq(matchResult.eventId, eventId));

  return results;
}

/**
 * 获取活动的匹配结果
 */
export async function getMatchResults(eventId: string): Promise<MatchResult[]> {
  return db()
    .select()
    .from(matchResult)
    .where(eq(matchResult.eventId, eventId));
}

export async function markMatchesAsNotified(eventId: string): Promise<void> {
  await db()
    .update(matchResult)
    .set({
      isNotified: true,
      notifiedAt: new Date(),
    })
    .where(eq(matchResult.eventId, eventId));
}

/**
 * 获取参与者的匹配
 */
export async function getParticipantMatches(participantId: string): Promise<Participant[]> {
  // 查找该参与者的所有匹配
  const matches = await db()
    .select()
    .from(matchResult)
    .where(
      sql`${matchResult.participant1Id} = ${participantId} OR ${matchResult.participant2Id} = ${participantId}`
    );

  // 获取匹配的另一方ID
  const matchedIds = matches.map((m) =>
    m.participant1Id === participantId ? m.participant2Id : m.participant1Id
  );

  if (matchedIds.length === 0) return [];

  // 获取匹配的参与者信息
  return db()
    .select()
    .from(participant)
    .where(inArray(participant.id, matchedIds));
}

/**
 * 获取活动匹配统计
 */
export async function getMatchStats(eventId: string): Promise<{
  totalParticipants: number;
  submittedChoices: number;
  totalMatches: number;
}> {
  // 使用聚合查询获取提交数量，避免 limit 限制和性能问题
  const [submittedResult] = await db()
    .select({ count: count() })
    .from(participant)
    .where(
      and(
        eq(participant.eventId, eventId),
        eq(participant.hasSubmittedChoices, true)
      )
    );

  const totalParticipants = await getParticipantsCount(eventId);
  const matches = await getMatchResults(eventId);

  return {
    totalParticipants,
    submittedChoices: submittedResult?.count || 0,
    totalMatches: matches.length,
  };
}
