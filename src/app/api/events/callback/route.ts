import { redirect } from 'next/navigation';

import { envConfigs } from '@/config';
import { findOrderByOrderNo } from '@/shared/models/order';
import { getUserInfo } from '@/shared/models/user';
import { getPaymentService, handleCheckoutSuccess } from '@/shared/services/payment';
import { createEvent, EventStatus } from '@/shared/models/event';

export async function GET(req: Request) {
  let redirectUrl = '';

  try {
    const { searchParams } = new URL(req.url);
    const orderNo = searchParams.get('order_no');

    if (!orderNo) {
      throw new Error('invalid callback params');
    }

    const user = await getUserInfo();
    if (!user || !user.email) {
      throw new Error('no auth, please sign in');
    }

    const order = await findOrderByOrderNo(orderNo);
    if (!order) {
      throw new Error('order not found');
    }

    if (!order.paymentSessionId || !order.paymentProvider) {
      throw new Error('invalid order');
    }

    if (order.userId !== user.id) {
      throw new Error('order and user not match');
    }

    const paymentService = await getPaymentService();
    const paymentProvider = paymentService.getProvider(order.paymentProvider);
    if (!paymentProvider) {
      throw new Error('payment provider not found');
    }

    const session = await paymentProvider.getPaymentSession({
      sessionId: order.paymentSessionId,
    });

    await handleCheckoutSuccess({ order, session });

    // create event from order description (stored draft)
    try {
      const draft = JSON.parse(order.description || '{}');
      if (draft && draft.name && draft.location && draft.eventDate && draft.eventTime && draft.eventType) {
        await createEvent({
          organizerId: user.id,
          name: draft.name,
          description: draft.description,
          location: draft.location,
          eventDate: new Date(draft.eventDate),
          eventTime: draft.eventTime,
          eventType: draft.eventType,
          capacity: 0,
          price: order.amount || 0,
          status: EventStatus.PAID,
        });
      }
    } catch (e) {
      console.log('create event from draft failed:', e);
    }

    redirectUrl = `${envConfigs.app_url}/my-events`;
  } catch (e: any) {
    console.log('events callback failed:', e);
    redirectUrl = `${envConfigs.app_url}/my-events/create`;
  }

  redirect(redirectUrl);
}

