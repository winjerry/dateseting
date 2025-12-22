import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { getAllConfigs } from '@/shared/models/config';
import { getPaymentServiceWithConfigs } from '@/shared/services/payment';
import { getSnowId, getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { PaymentInterval, PaymentOrder, PaymentPrice, PaymentType } from '@/extensions/payment/types';
import { EVENT_PRICES, EventType } from '@/shared/models/event';
import { NewOrder, OrderStatus, createOrder, updateOrderByOrderNo } from '@/shared/models/order';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id || !session.user.email) {
      return respErr('no auth, please sign in');
    }

    const body = await request.json();
    const { name, description, location, eventDate, eventTime, eventType } = body || {};

    if (!name || !location || !eventDate || !eventTime || !eventType) {
      return respErr('invalid event draft');
    }

    const type = String(eventType) as EventType;
    const amount = EVENT_PRICES[type];
    if (!amount) {
      return respErr('invalid event type');
    }

    const configs = await getAllConfigs();
    const paymentManager = getPaymentServiceWithConfigs(configs);
    const defaultProvider = configs.default_payment_provider;
    const provider = paymentManager.getProvider(defaultProvider);

    if (!provider || !provider.name) {
      return respErr('no payment provider configured');
    }

    const orderNo = getSnowId();

    const checkoutPrice: PaymentPrice = {
      amount,
      currency: (configs.default_currency || 'usd').toLowerCase(),
    };

    const checkoutOrder: PaymentOrder = {
      description: `Speed Dating Event (${type})`,
      customer: {
        name: session.user.name || '',
        email: session.user.email!,
      },
      type: PaymentType.ONE_TIME,
      price: checkoutPrice,
      metadata: {
        order_no: orderNo,
        event_draft: JSON.stringify({ name, description, location, eventDate, eventTime, eventType }),
      },
      successUrl: `${configs.app_url}/api/events/callback?order_no=${orderNo}`,
      cancelUrl: `${configs.app_url}/my-events/create`,
    };

    const currentTime = new Date();
    const newOrder: NewOrder = {
      id: getUuid(),
      orderNo,
      userId: session.user.id,
      userEmail: session.user.email!,
      status: OrderStatus.PENDING,
      amount,
      currency: checkoutPrice.currency,
      productId: `event_${type}`,
      paymentType: PaymentType.ONE_TIME,
      paymentInterval: PaymentInterval.ONE_TIME,
      paymentProvider: provider.name,
      checkoutInfo: JSON.stringify(checkoutOrder),
      createdAt: currentTime,
      productName: `Event ${type}`,
      description: JSON.stringify({ name, description, location, eventDate, eventTime, eventType }),
      callbackUrl: `${configs.app_url}/my-events`,
      creditsAmount: 0,
      creditsValidDays: 0,
      planName: '',
      paymentProductId: '',
    };

    await createOrder(newOrder);

    try {
      const result = await provider.createPayment({ order: checkoutOrder });

      await updateOrderByOrderNo(orderNo, {
        status: OrderStatus.CREATED,
        checkoutInfo: JSON.stringify(result.checkoutParams),
        checkoutResult: JSON.stringify(result.checkoutResult),
        checkoutUrl: result.checkoutInfo.checkoutUrl,
        paymentSessionId: result.checkoutInfo.sessionId,
        paymentProvider: result.provider,
      });

      return respData(result.checkoutInfo);
    } catch (e: any) {
      await updateOrderByOrderNo(orderNo, {
        status: OrderStatus.COMPLETED,
        checkoutInfo: JSON.stringify(checkoutOrder),
      });
      return respErr('checkout failed: ' + e.message);
    }
  } catch (e: any) {
    console.log('events checkout failed:', e);
    return respErr('events checkout failed: ' + e.message);
  }
}

