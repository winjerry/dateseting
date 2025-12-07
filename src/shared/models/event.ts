import { and, count, desc, eq, isNull, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/core/db';
import { event } from '@/config/db/schema';
import { appendUserToResult, User } from './user';

// =========================================
// Types
// =========================================

export type Event = typeof event.$inferSelect & {
  user?: User;
};
export type NewEvent = typeof event.$inferInsert;
export type UpdateEvent = Partial<Omit<NewEvent, 'id' | 'eventNo' | 'createdAt'>>;

export enum EventStatus {
  DRAFT = 'draft',        // 草稿，待支付
  PAID = 'paid',          // 已支付，待激活
  ACTIVE = 'active',      // 活动进行中
  COMPLETED = 'completed', // 活动已结束
  CANCELLED = 'cancelled', // 已取消
}

export enum EventType {
  STANDARD = 'standard',  // 标准版 100人 $49
  LARGE = 'large',        // 大型版 200人 $99
}

// 活动价格配置（分）
export const EVENT_PRICES = {
  [EventType.STANDARD]: 4900, // $49
  [EventType.LARGE]: 9900,    // $99
};

export const EVENT_CAPACITIES = {
  [EventType.STANDARD]: 100,
  [EventType.LARGE]: 200,
};

// =========================================
// Event CRUD Operations
// =========================================

/**
 * 生成活动编号 EVT-YYYYMMDD-XXXX
 */
export function generateEventNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVT-${dateStr}-${random}`;
}

/**
 * 创建新活动
 */
export async function createEvent(newEvent: Omit<NewEvent, 'id' | 'eventNo' | 'createdAt' | 'updatedAt'>): Promise<Event> {
  const id = uuidv4();
  const eventNo = generateEventNo();
  
  const [result] = await db()
    .insert(event)
    .values({
      ...newEvent,
      id,
      eventNo,
    })
    .returning();

  return result;
}

/**
 * 获取活动列表
 */
export async function getEvents({
  organizerId,
  status,
  eventType,
  getUser,
  page = 1,
  limit = 20,
}: {
  organizerId?: string;
  status?: EventStatus;
  eventType?: EventType;
  getUser?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<Event[]> {
  const result = await db()
    .select()
    .from(event)
    .where(
      and(
        organizerId ? eq(event.organizerId, organizerId) : undefined,
        status ? eq(event.status, status) : undefined,
        eventType ? eq(event.eventType, eventType) : undefined,
        isNull(event.deletedAt)
      )
    )
    .orderBy(desc(event.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}

/**
 * 获取活动总数
 */
export async function getEventsCount({
  organizerId,
  status,
}: {
  organizerId?: string;
  status?: EventStatus;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(event)
    .where(
      and(
        organizerId ? eq(event.organizerId, organizerId) : undefined,
        status ? eq(event.status, status) : undefined
      )
    );

  return result?.count || 0;
}

/**
 * 通过ID查找活动
 */
export async function findEventById(id: string): Promise<Event | undefined> {
  const [result] = await db()
    .select()
    .from(event)
    .where(eq(event.id, id));

  return result;
}

/**
 * 通过活动编号查找活动
 */
export async function findEventByEventNo(eventNo: string): Promise<Event | undefined> {
  const [result] = await db()
    .select()
    .from(event)
    .where(eq(event.eventNo, eventNo));

  return result;
}

/**
 * 更新活动
 */
export async function updateEventById(
  id: string,
  updateData: UpdateEvent
): Promise<Event | undefined> {
  const [result] = await db()
    .update(event)
    .set(updateData)
    .where(eq(event.id, id))
    .returning();

  return result;
}

/**
 * 更新活动参与人数
 */
export async function incrementParticipantCount(eventId: string): Promise<void> {
  await db()
    .update(event)
    .set({
      currentParticipants: sql`${event.currentParticipants} + 1`,
    })
    .where(eq(event.id, eventId));
}

/**
 * 检查活动是否已满
 */
export async function isEventFull(eventId: string): Promise<boolean> {
  const eventData = await findEventById(eventId);
  if (!eventData) return true;
  
  return eventData.currentParticipants >= eventData.capacity;
}

/**
 * 软删除活动
 */
export async function deleteEvent(id: string): Promise<void> {
  await db()
    .update(event)
    .set({ deletedAt: new Date() })
    .where(eq(event.id, id));
}

/**
 * 获取组织者的活动统计
 */
export async function getOrganizerStats(organizerId: string): Promise<{
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalParticipants: number;
}> {
  const events = await getEvents({ organizerId });
  
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === EventStatus.ACTIVE).length;
  const completedEvents = events.filter(e => e.status === EventStatus.COMPLETED).length;
  const totalParticipants = events.reduce((sum, e) => sum + e.currentParticipants, 0);

  return {
    totalEvents,
    activeEvents,
    completedEvents,
    totalParticipants,
  };
}
