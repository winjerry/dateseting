import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { findOrderByOrderNo, updateOrderByOrderNo } from '@/shared/models/order';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderNo, ...eventData } = body;

    if (!orderNo) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    const order = await findOrderByOrderNo(orderNo);

    if (!order) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update order description and metadata
    const eventDetails = JSON.stringify(eventData);
    let checkoutInfo: any = {};
    try {
      checkoutInfo = JSON.parse(order.checkoutInfo || '{}');
      if (!checkoutInfo.metadata) checkoutInfo.metadata = {};
      checkoutInfo.metadata.event_draft = eventDetails;
    } catch (e) {
      console.error('Failed to parse checkoutInfo', e);
    }

    await updateOrderByOrderNo(orderNo, {
      description: eventDetails,
      checkoutInfo: JSON.stringify(checkoutInfo),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update draft' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');

    if (!orderNo) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    const order = await findOrderByOrderNo(orderNo);

    if (!order) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    let eventDetails = {};
    try {
      // 1. Try to parse from description first (most reliable source)
      if (order.description && order.description.trim().startsWith('{')) {
        try {
          eventDetails = JSON.parse(order.description);
        } catch (e) {
          console.warn('Failed to parse description as JSON', e);
        }
      }

      // 2. If description didn't yield data, try checkoutInfo metadata
      if (Object.keys(eventDetails).length === 0) {
        const checkoutInfo = JSON.parse(order.checkoutInfo || '{}');
        if (checkoutInfo.metadata && checkoutInfo.metadata.event_draft) {
          eventDetails = JSON.parse(checkoutInfo.metadata.event_draft);
        }
      }
    } catch (e) {
      console.error('Failed to parse draft details', e);
    }

    return NextResponse.json({
      success: true,
      draft: eventDetails,
    });
  } catch (error: any) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}