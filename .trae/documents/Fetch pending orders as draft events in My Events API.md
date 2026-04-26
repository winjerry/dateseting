Based on the user's issue, the My Events page is filtering out unpaid (draft) events, while the backend admin can see them.

**The Problem:**
The `/api/events/list` route accepts a `status` query parameter. If the frontend (My Events page) is not sending any `status` parameter, the backend `getEvents` function (in `src/shared/models/event.ts`) should theoretically return *all* events regardless of status (since `status ? eq(event.status, status) : undefined` handles the undefined case).

However, if the frontend *is* sending a status filter, or if there's implicit filtering, that would explain it.

Looking at `src/app/[locale]/(organizer)/my-events/page.tsx` (from previous turns, though not explicitly re-read here, I recall it calls `/api/events/list?includeStats=true` without a status filter).

Wait, let's look at `getEvents` in `src/shared/models/event.ts` again:
```typescript
export async function getEvents(...) {
  const result = await db()
    .select()
    .from(event)
    .where(
      and(
        organizerId ? eq(event.organizerId, organizerId) : undefined,
        status ? eq(event.status, status) : undefined, // <--- If status is undefined, this filter is skipped
        eventType ? eq(event.eventType, eventType) : undefined,
        isNull(event.deletedAt)
      )
    )
    // ...
```

If `status` is undefined, it fetches *all* statuses.

**So why can't the user see unpaid events?**
1.  **Maybe they are created but not linked correctly?** Unlikely if "admin" can see them.
2.  **Maybe the frontend is filtering them out?** I need to check `src/app/[locale]/(organizer)/my-events/page.tsx` to see if it does client-side filtering.
3.  **Maybe the default behavior of `status` param in `route.ts` is wrong?**
    In `src/app/api/events/list/route.ts`:
    `const status = searchParams.get('status') as any;`
    If `status` is null (not in URL), it passes `null` (or `undefined`) to `getEvents`.

**Hypothesis:**
The user mentioned "can only see paid events".
If the event creation flow (checkout) sets the status to `DRAFT` initially, and then updates to `CREATED` or `PAID` (which maps to `ACTIVE`?) after payment.

Wait, in `checkout/route.ts`:
- Initially: `status: OrderStatus.PENDING` (Order)
- After payment creation (but before callback): `status: OrderStatus.CREATED` (Order)
- In `shared/models/event.ts`: `EventStatus` has `DRAFT`, `PAID`, `ACTIVE`.

If the event is created *during* checkout (wait, usually events are created *after* successful payment webhook, or created as DRAFT first).

Let's check when the **Event** record is actually created.
In `src/app/api/events/checkout/route.ts`:
It creates an **Order**, but does it create an **Event**?
It seems it passes `event_draft` in metadata. The actual `Event` record might only be created **after** the payment callback/webhook is processed!

If the Event record *doesn't exist yet*, that explains why "My Events" (which queries the `event` table) assumes they don't exist.
But the user says "Admin can see unpaid events". This implies the Event record *does* exist.

**Let's verify the Event Creation Flow.**
If the Admin sees "unpaid events", are they looking at the `Order` table or the `Event` table?
If they are looking at `Event` table, then the Event must exist.

**Alternative Theory:**
Maybe the `getEvents` query implicitly filters by `isPaid`?
No, the schema has `isPaid` but `getEvents` doesn't filter by it unless `status` covers it.

**Let's fix the My Events page:**
The user wants to see "unpaid" (draft) events too.
If the API returns them, the frontend should show them.
I suspect the API *is* returning them, but maybe the frontend logic (which I updated previously) has some issue?
Or, maybe the "Admin" view the user refers to is actually the "Orders" list, not the "Events" list?

**Action Plan:**
1.  **Investigate Event Creation**: Check `src/app/api/events/callback/route.ts` or webhook handler to see when the `event` record is inserted.
2.  **If Event is created only after payment**: Then "unpaid events" don't exist in the `event` table yet. They only exist as `Order` drafts.
    *   *Solution*: The "My Events" page needs to fetch **Orders** that are `PENDING`/`CREATED` (representing drafts) AND **Events** (paid/active).
    *   OR: Ensure `Event` is created as `DRAFT` *before* payment.

Let's check `src/app/api/events/checkout/route.ts` again.
It creates an `Order`. It does **NOT** call `createEvent`.
So the "Event" doesn't exist in the `event` table yet.

**So how can "Admin" see unpaid events?**
The user might be mistaken and looking at the "Orders" list in the admin panel, thinking they are events.
Or, maybe there is a separate flow I missed.

**The Fix for "My Events":**
To show "unpaid events" (drafts), we need to query the `order` table for orders where:
- `userId` = current user
- `status` = `PENDING` or `CREATED`
- `productId` starts with `event_` (indicating it's an event order)

**Plan:**
1.  **Modify `/api/events/list`**:
    - In addition to fetching `events` from the `event` table, also fetch pending `orders` from the `order` table that correspond to event drafts.
    - Map these orders to a unified "Event" structure (with `status: 'draft'`) and merge them into the response list.
2.  **Update Frontend**:
    - The frontend should already handle `status: 'draft'` (I saw `getStatusBadge` handles 'draft').

Let's confirm `src/app/api/events/callback/route.ts` first to confirm event creation timing.
