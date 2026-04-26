import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { getEvents, getEventsCount, getOrganizerStats, EventStatus } from '@/shared/models/event';
import { getOrders, OrderStatus } from '@/shared/models/order';

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession();
    if (!session?.user?.id) {
      console.log('API /events/list: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized: User not logged in' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as any;
    const includeStats = searchParams.get('includeStats') === 'true';

    console.log(`API /events/list: Fetching events for user ${session.user.id}, page=${page}, limit=${limit}`);

    // 获取活动列表
    let events: any[] = await getEvents({
      organizerId: session.user.id,
      status,
      page,
      limit,
    });

    // 如果是第一页，且没有状态过滤或包含'draft'状态，获取草稿订单
    if (page === 1 && (!status || status === EventStatus.DRAFT)) {
      const draftOrders = await getOrders({
        userId: session.user.id,
        status: OrderStatus.CREATED,
        limit: 10,
      });

      const draftEvents = draftOrders
        .filter(order => order.productId && order.productId.startsWith('event_'))
        .map(order => {
          let eventDetails: any = {};
          try {
            // 从checkoutInfo或description中解析事件详情
            // checkoutInfo通常包含完整的order payload
            const checkoutInfo = JSON.parse(order.checkoutInfo || '{}');
            if (checkoutInfo.metadata && checkoutInfo.metadata.event_draft) {
              eventDetails = JSON.parse(checkoutInfo.metadata.event_draft);
            } else if (order.description && order.description.startsWith('{')) {
              eventDetails = JSON.parse(order.description);
            }
          } catch (e) {
            console.error('Failed to parse draft event details:', e);
          }

          return {
            id: `draft_${order.orderNo}`,
            eventNo: order.orderNo, // 使用订单号作为临时活动编号
            name: eventDetails.name || order.productName || 'Draft Event',
            description: eventDetails.description || order.description,
            location: eventDetails.location || '',
            eventDate: eventDetails.eventDate || order.createdAt,
            eventTime: eventDetails.eventTime || '',
            status: EventStatus.DRAFT,
            capacity: 0,
            currentParticipants: 0,
            createdAt: order.createdAt,
            // 标记为草稿，前端可以特殊处理（如跳转到支付）
            isDraft: true,
            orderNo: order.orderNo,
            checkoutUrl: order.checkoutUrl,
          };
        });
      
      // 将草稿合并到列表顶部
      events = [...draftEvents, ...events];
    }

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

    console.log(`API /events/list: Success, found ${events.length} events`);

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
  } catch (error: any) {
    console.error('API /events/list Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list events' },
      { status: 500 }
    );
  }
}
