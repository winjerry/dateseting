import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/core/auth/session';
import { getAllConfigs } from '@/shared/models/config';
import { getPaymentServiceWithConfigs } from '@/shared/services/payment';
import { getSnowId, getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { PaymentInterval, PaymentOrder, PaymentPrice, PaymentType } from '@/extensions/payment/types';
import { EVENT_PRICES, EventType } from '@/shared/models/event';
import { NewOrder, OrderStatus, createOrder, updateOrderByOrderNo, findOrderByOrderNo } from '@/shared/models/order';
import { findUserById } from '@/shared/models/user';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id || !session.user.email) {
      return respErr('no auth, please sign in');
    }

    // Verify user exists in database to avoid foreign key constraint violations
    const userExists = await findUserById(session.user.id);
    if (!userExists) {
      return respErr('User record not found. Please sign out and sign in again.');
    }

    const body = await request.json();
    const { name, description, location, eventDate, eventTime, eventEndTime, eventType, payment_provider, draftId } = body || {};

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
    let provider = paymentManager.getProvider(payment_provider || defaultProvider);

    if (!provider) {
      provider = paymentManager.getDefaultProvider();
    }

    if (!provider || !provider.name) {
      return respErr('no payment provider configured');
    }

    let orderNo: string;
    let isUpdate = false;

    // Check if we are updating an existing draft
    if (draftId) {
      const existingOrder = await findOrderByOrderNo(draftId);
      if (existingOrder && existingOrder.userId === session.user.id && existingOrder.status !== OrderStatus.PAID) {
        orderNo = draftId;
        isUpdate = true;
      } else {
        // Fallback to new order if draft not found or invalid
        orderNo = getSnowId();
      }
    } else {
      orderNo = getSnowId();
    }

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
        event_draft: JSON.stringify({ name, description, location, eventDate, eventTime, eventEndTime, eventType }),
      },
      successUrl: `${configs.app_url}/api/events/callback?order_no=${orderNo}`,
      cancelUrl: `${configs.app_url}/my-events/create`,
    };

    const currentTime = new Date();
    const orderDescription = JSON.stringify({ name, description, location, eventDate, eventTime, eventEndTime, eventType });

    if (!isUpdate) {
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
        description: orderDescription,
        callbackUrl: `${configs.app_url}/my-events`,
        creditsAmount: 0,
        creditsValidDays: 0,
        planName: '',
        paymentProductId: '',
      };

      await createOrder(newOrder);
    } else {
      // Update existing draft order
      await updateOrderByOrderNo(orderNo, {
        amount,
        currency: checkoutPrice.currency,
        productId: `event_${type}`,
        paymentProvider: provider.name,
        checkoutInfo: JSON.stringify(checkoutOrder),
        productName: `Event ${type}`,
        description: orderDescription,
        status: OrderStatus.PENDING, // Reset status to PENDING for new checkout attempt
      });
    }

    try {
      console.log('Creating payment with provider:', provider.name);
      console.log('Checkout order:', JSON.stringify(checkoutOrder, null, 2));
      
      const result = await provider.createPayment({ order: checkoutOrder });
      
      console.log('Payment creation result:', JSON.stringify(result, null, 2));

      if (!result.checkoutInfo?.checkoutUrl) {
        console.error('Missing checkoutUrl in payment result');
      }

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
        status: OrderStatus.FAILED,
        checkoutInfo: JSON.stringify(checkoutOrder),
      });
      return respErr('checkout failed: ' + e.message);
    }
  } catch (e: any) {
    console.log('events checkout failed:', e);
    return respErr('events checkout failed: ' + e.message);
  }
}

