import { and, count, desc, eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/core/db';
import { icebreakerGuide } from '@/config/db/schema';

// =========================================
// Types
// =========================================

export type IcebreakerGuide = typeof icebreakerGuide.$inferSelect;
export type NewIcebreakerGuide = typeof icebreakerGuide.$inferInsert;
export type UpdateIcebreakerGuide = Partial<Omit<NewIcebreakerGuide, 'id' | 'createdAt'>>;

export enum IcebreakerCategory {
  ICEBREAKER = 'icebreaker', // 破冰问题
  DEEPER = 'deeper',         // 深层问题
}

// 默认破冰问题
export const DEFAULT_ICEBREAKERS: { category: IcebreakerCategory; question: string }[] = [
  // 破冰问题
  { category: IcebreakerCategory.ICEBREAKER, question: "What's your favorite way to spend a weekend?" },
  { category: IcebreakerCategory.ICEBREAKER, question: "If you could travel anywhere, where would you go?" },
  { category: IcebreakerCategory.ICEBREAKER, question: "What's the last show you binge-watched?" },
  { category: IcebreakerCategory.ICEBREAKER, question: "Coffee or tea person? ☕" },
  { category: IcebreakerCategory.ICEBREAKER, question: "What's your hidden talent?" },
  // 深层问题
  { category: IcebreakerCategory.DEEPER, question: "What are you passionate about?" },
  { category: IcebreakerCategory.DEEPER, question: "Where do you see yourself in 5 years?" },
  { category: IcebreakerCategory.DEEPER, question: "What makes you laugh the most?" },
  { category: IcebreakerCategory.DEEPER, question: "What's your ideal day like?" },
  { category: IcebreakerCategory.DEEPER, question: "What's most important to you?" },
];

// =========================================
// CRUD Operations
// =========================================

/**
 * 初始化默认破冰问题
 */
export async function initializeDefaultIcebreakers(): Promise<void> {
  const existingCount = await getIcebreakersCount();
  if (existingCount > 0) return;

  const icebreakers = DEFAULT_ICEBREAKERS.map((item, index) => ({
    id: uuidv4(),
    category: item.category,
    question: item.question,
    isActive: true,
    sort: index,
  }));

  await db().insert(icebreakerGuide).values(icebreakers);
}

/**
 * 获取所有激活的破冰问题
 */
export async function getActiveIcebreakers(): Promise<{
  icebreakers: IcebreakerGuide[];
  deeper: IcebreakerGuide[];
}> {
  const all = await db()
    .select()
    .from(icebreakerGuide)
    .where(eq(icebreakerGuide.isActive, true))
    .orderBy(asc(icebreakerGuide.sort));

  return {
    icebreakers: all.filter((q) => q.category === IcebreakerCategory.ICEBREAKER),
    deeper: all.filter((q) => q.category === IcebreakerCategory.DEEPER),
  };
}

/**
 * 获取破冰问题数量
 */
export async function getIcebreakersCount(): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(icebreakerGuide);

  return result?.count || 0;
}

/**
 * 创建破冰问题
 */
export async function createIcebreaker(
  newIcebreaker: Omit<NewIcebreakerGuide, 'id'>
): Promise<IcebreakerGuide> {
  const [result] = await db()
    .insert(icebreakerGuide)
    .values({
      ...newIcebreaker,
      id: uuidv4(),
    })
    .returning();

  return result;
}

/**
 * 更新破冰问题
 */
export async function updateIcebreaker(
  id: string,
  updateData: UpdateIcebreakerGuide
): Promise<IcebreakerGuide | undefined> {
  const [result] = await db()
    .update(icebreakerGuide)
    .set(updateData)
    .where(eq(icebreakerGuide.id, id))
    .returning();

  return result;
}

/**
 * 删除破冰问题
 */
export async function deleteIcebreaker(id: string): Promise<void> {
  await db()
    .delete(icebreakerGuide)
    .where(eq(icebreakerGuide.id, id));
}
