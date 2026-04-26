import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

import { db } from '@/core/db';
import { user } from '@/config/db/schema';
import {
  createEvent,
  EVENT_CAPACITIES,
  EVENT_PRICES,
  EventStatus,
  EventType,
  updateEventById,
} from '@/shared/models/event';
import {
  calculateMatches,
  getMatchResults,
  ParticipantStatus,
  registerParticipantForEvent,
  RegistrationSource,
  submitParticipantChoices,
} from '@/shared/models/participant';
import { getAllConfigs } from '@/shared/models/config';
import { PaymentType } from '@/extensions/payment/types';
import { getPaymentServiceWithConfigs } from '@/shared/services/payment';
import { getStorageServiceWithConfigs } from '@/shared/services/storage';

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

function record(results: CheckResult[], name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name} - ${detail}`);
}

async function main() {
  const results: CheckResult[] = [];
  const now = Date.now();
  const organizerId = uuidv4();
  const organizerEmail = `pairivo-smoke-organizer-${now}@example.com`;
  let createdUser = false;

  try {
    const configs = await getAllConfigs();

    const requiredConfigKeys = [
      'default_payment_provider',
      'stripe_enabled',
      'stripe_secret_key',
      'stripe_publishable_key',
      'resend_api_key',
      'resend_sender_email',
      'r2_access_key',
      'r2_secret_key',
      'r2_bucket_name',
      'r2_endpoint',
    ];

    const missingKeys = requiredConfigKeys.filter((key) => !configs[key]);
    record(
      results,
      'Config presence',
      missingKeys.length === 0,
      missingKeys.length === 0
        ? 'Core smoke config is present'
        : `Missing: ${missingKeys.join(', ')}`
    );

    await db()
      .insert(user)
      .values({
        id: organizerId,
        name: 'Pairivo Smoke Organizer',
        email: organizerEmail,
        emailVerified: true,
        projectApp: 'speeddate',
      });
    createdUser = true;
    record(results, 'Organizer user', true, organizerEmail);

    const smokeEvent = await createEvent({
      organizerId,
      name: `Pairivo Smoke Event ${now}`,
      description: 'Automated smoke test event',
      location: 'Smoke Test Location',
      eventDate: new Date(),
      eventTime: '19:00',
      eventType: EventType.STANDARD,
      capacity: EVENT_CAPACITIES[EventType.STANDARD],
      price: EVENT_PRICES[EventType.STANDARD],
      status: EventStatus.PAID,
      isPaid: true,
      shareLink: '',
    });
    record(results, 'Event creation', true, `${smokeEvent.id} / ${smokeEvent.eventNo}`);

    const participants = await Promise.all(
      ['a', 'b', 'c'].map((suffix, index) =>
        registerParticipantForEvent(smokeEvent.id, {
          eventId: smokeEvent.id,
          name: `Smoke Participant ${suffix.toUpperCase()}`,
          age: 25 + index,
          gender: index % 2 === 0 ? 'female' : 'male',
          email: `pairivo-smoke-${now}-${suffix}@example.com`,
          phone: '',
          interests: JSON.stringify(['Music', 'Travel']),
          photoUrl: 'https://example.com/avatar.png',
          registrationSource: RegistrationSource.LINK,
          status: ParticipantStatus.REGISTERED,
        })
      )
    );
    record(
      results,
      'Participant registration',
      true,
      `${participants.length} participants registered`
    );

    let duplicateBlocked = false;
    try {
      await registerParticipantForEvent(smokeEvent.id, {
        eventId: smokeEvent.id,
        name: 'Duplicate User',
        age: 30,
        gender: 'male',
        email: participants[0].email,
        phone: '',
        interests: JSON.stringify(['Music']),
        photoUrl: 'https://example.com/avatar.png',
        registrationSource: RegistrationSource.LINK,
        status: ParticipantStatus.REGISTERED,
      });
    } catch (error: any) {
      duplicateBlocked = error?.message === 'EMAIL_ALREADY_REGISTERED';
    }
    record(
      results,
      'Duplicate registration blocked',
      duplicateBlocked,
      duplicateBlocked
        ? 'Duplicate email correctly blocked'
        : 'Duplicate email was not blocked'
    );

    const paymentService = getPaymentServiceWithConfigs(configs);
    const provider =
      paymentService.getProvider(configs.default_payment_provider) ||
      paymentService.getDefaultProvider();

    if (!provider) {
      record(results, 'Payment provider', false, 'No available payment provider');
    } else {
      const checkoutSession = await provider.createPayment({
        order: {
          description: 'Pairivo Smoke Test Checkout',
          customer: {
            name: 'Smoke Tester',
            email: `pairivo-smoke-buyer-${now}@example.com`,
          },
          type: PaymentType.ONE_TIME,
          price: {
            amount: 100,
            currency: 'usd',
          },
          metadata: {
            smoke_test: 'true',
            event_no: smokeEvent.eventNo,
          },
          successUrl: `${configs.app_url}/api/events/callback?order_no=SMOKE-${now}`,
          cancelUrl: `${configs.app_url}/my-events/create`,
        },
      });

      const paymentSession = await provider.getPaymentSession({
        sessionId: checkoutSession.checkoutInfo.sessionId,
      });

      record(
        results,
        'Payment checkout session',
        !!checkoutSession.checkoutInfo.checkoutUrl,
        checkoutSession.checkoutInfo.checkoutUrl || 'No checkoutUrl returned'
      );
      record(
        results,
        'Payment session retrieval',
        !!paymentSession,
        paymentSession?.paymentStatus || 'No payment status'
      );
    }

    const storage = getStorageServiceWithConfigs(configs);
    const tinyPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6r9xkAAAAASUVORK5CYII=',
      'base64'
    );
    const upload = await storage.uploadFile({
      body: tinyPng,
      key: `uploads/pairivo-smoke-${now}.png`,
      contentType: 'image/png',
      disposition: 'inline',
    });
    record(results, 'Storage upload', upload.success, upload.url || upload.error || '');

    if (upload.success && upload.url) {
      try {
        const headResp = await fetch(upload.url, { method: 'HEAD' });
        const publicAccessible = headResp.status >= 200 && headResp.status < 400;
        record(results, 'Storage public access', publicAccessible, `HEAD ${headResp.status}`);
      } catch (error: any) {
        record(
          results,
          'Storage public access',
          false,
          error?.message || 'HEAD request failed'
        );
      }
    }

    await updateEventById(smokeEvent.id, {
      status: EventStatus.COMPLETED,
    });
    record(results, 'Event status transition', true, 'PAID -> COMPLETED');

    await submitParticipantChoices(participants[0].id, smokeEvent.id, [
      participants[1].id,
    ]);
    await submitParticipantChoices(participants[1].id, smokeEvent.id, [
      participants[0].id,
    ]);
    await submitParticipantChoices(participants[2].id, smokeEvent.id, []);
    record(results, 'Choices submission', true, '3/3 submitted');

    await calculateMatches(smokeEvent.id);
    const matches = await getMatchResults(smokeEvent.id);
    record(results, 'Match calculation', matches.length > 0, `Matches: ${matches.length}`);

    if (configs.resend_api_key && configs.resend_sender_email) {
      const resend = new Resend(configs.resend_api_key);

      const listSendResults = await Promise.allSettled(
        participants.map((p) =>
          resend.emails.send({
            from: configs.resend_sender_email,
            to: p.email,
            subject: `[SMOKE] Participant List - ${smokeEvent.name}`,
            html: `<h2>Participant List</h2><p>Event: ${smokeEvent.name}</p>`,
          })
        )
      );

      const listSuccess = listSendResults.filter(
        (r) => r.status === 'fulfilled' && !(r.value as any)?.error
      ).length;
      record(
        results,
        'Participant list emails',
        listSuccess === participants.length,
        `${listSuccess}/${participants.length} succeeded`
      );

      const matchSendResults = await Promise.allSettled(
        participants.slice(0, 2).map((p) =>
          resend.emails.send({
            from: configs.resend_sender_email,
            to: p.email,
            subject: `[SMOKE] Match Results - ${smokeEvent.name}`,
            html: `<h2>You have a match</h2><p>Event: ${smokeEvent.name}</p>`,
          })
        )
      );

      const matchSuccess = matchSendResults.filter(
        (r) => r.status === 'fulfilled' && !(r.value as any)?.error
      ).length;
      record(results, 'Match result emails', matchSuccess === 2, `${matchSuccess}/2 succeeded`);
    } else {
      record(results, 'Email sending', false, 'Resend config missing; skipped');
    }
  } catch (error: any) {
    record(results, 'Smoke run', false, error?.message || String(error));
  } finally {
    if (createdUser) {
      await db().delete(user).where(eq(user.id, organizerId));
      record(results, 'Cleanup', true, 'Deleted test user and cascaded data');
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.log('\n=== Smoke Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log(
      'Failed checks:',
      results
        .filter((r) => !r.ok)
        .map((r) => `${r.name}(${r.detail})`)
        .join('; ')
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
