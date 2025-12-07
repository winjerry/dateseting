import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { getEvents, getEventsCount, getOrganizerStats } from '@/shared/models/event';

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as any;
    const includeStats = searchParams.get('includeStats') === 'true';

    // 获取活动列表
    const events = await getEvents({
      organizerId: session.user.id,
      status,
      page,
      limit,
    });

    // 获取总数
    const total = await getEventsCount({
      organizerId: session.user.id,
      status,
    });

    // 可选：获取统计数据
    let stats = null;
    if (includeStats) {
      stats = await getOrganizerStats(session.user.id);
    }

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Error listing events:', error);
    return NextResponse.json(
      { error: 'Failed to list events' },
      { status: 500 }
    );
  }
}
