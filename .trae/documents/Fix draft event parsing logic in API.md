The user reports that clicking the "Edit" button for a draft event leads to a blank "Create Event" page.

**Root Cause Analysis:**
1.  **Draft Fetching Logic**: In `src/app/api/events/draft/route.ts`, the logic attempts to parse `eventDetails` from `order.checkoutInfo` or `order.description`.
2.  **Order Creation Logic**: In `src/app/api/events/checkout/route.ts`, the order is created with `checkoutInfo: JSON.stringify(checkoutOrder)`.
3.  **The Update**: Crucially, after `provider.createPayment` succeeds, `checkoutInfo` is **updated** with `JSON.stringify(result.checkoutParams)`.
    *   `result.checkoutParams` comes from Stripe (or other provider). Does it preserve the `metadata` with `event_draft`?
    *   In `src/extensions/payment/stripe.ts`, `createPayment` sets `sessionParams.metadata = order.metadata`. So yes, Stripe session params *should* contain the metadata.
    *   However, if `result.checkoutParams` (Stripe params) is what's stored in `checkoutInfo`, the structure might be different than what `draft/route.ts` expects.

**Specific Issue:**
In `draft/route.ts`:
```typescript
const checkoutInfo = JSON.parse(order.checkoutInfo || '{}');
if (checkoutInfo.metadata && checkoutInfo.metadata.event_draft) {
  eventDetails = JSON.parse(checkoutInfo.metadata.event_draft);
}
```

If `checkoutInfo` is the Stripe Session Params object, it likely has `metadata`. But let's look at `checkout/route.ts`:
```typescript
await updateOrderByOrderNo(orderNo, {
  // ...
  checkoutInfo: JSON.stringify(result.checkoutParams),
  // ...
});
```
And in `stripe.ts`:
```typescript
return {
  // ...
  checkoutParams: sessionParams,
  // ...
};
```
And `sessionParams` has `metadata`.

**Potential Failure Point:**
If `result.checkoutParams` structure is slightly different or if `metadata.event_draft` is not being preserved exactly as expected in the serialized JSON.
OR, more likely, `order.description` fallback is being hit but `order.description` might not be the JSON string anymore?
In `checkout/route.ts`, `description` is set to `JSON.stringify({ name, ... })`.
BUT, in `checkoutOrder` (sent to payment provider), `description` is `Speed Dating Event (${type})`.
Wait, `newOrder.description` is set to `JSON.stringify(...)`.
So `order.description` *should* contain the event details directly!

In `draft/route.ts`:
```typescript
} else if (order.description && order.description.startsWith('{')) {
  eventDetails = JSON.parse(order.description);
}
```
This fallback looks correct.

**Why is it failing?**
Maybe `order.checkoutInfo` exists (so the first `if` block is entered), but `metadata.event_draft` is missing or structured differently, so `eventDetails` stays empty. The `else if` (fallback to description) is **NOT reached** because it's an `else if` connected to the `checkoutInfo` check? No, let's look closely.

```typescript
const checkoutInfo = JSON.parse(order.checkoutInfo || '{}');
if (checkoutInfo.metadata && checkoutInfo.metadata.event_draft) {
  eventDetails = JSON.parse(checkoutInfo.metadata.event_draft);
} else if (order.description && order.description.startsWith('{')) { // <--- This is an ELSE IF
  eventDetails = JSON.parse(order.description);
}
```

**The Bug:**
If `checkoutInfo` exists (which it does, as it's updated with Stripe params), but `metadata.event_draft` is missing (or maybe Stripe truncates it? or it's not in the returned params object?), then the first `if` is false, and it goes to `else if`.
If `order.description` is NOT the JSON string, then it fails.
In `checkout/route.ts`, `newOrder.description` is set to the JSON string.
However, `checkoutOrder.description` (sent to provider) is "Speed Dating Event...".
Does `createPayment` update `order.description`? No.
Does `updateOrderByOrderNo` update `description`? No.
So `order.description` in the DB should be the JSON string.

**Hypothesis:**
Maybe `checkoutInfo` *does* have metadata, but `event_draft` inside it is somehow messed up (e.g., double stringified?).
OR, maybe `checkoutInfo` is NOT what we think it is.

**Fix Strategy:**
1.  **Relax the Logic**: Instead of `else if`, use independent checks. Try to find the data in `checkoutInfo`. If not found, try `description`.
2.  **Add Logging**: To debug why it's returning empty.

**Refined Plan:**
1.  **Modify `src/app/api/events/draft/route.ts`**:
    *   Change the logic to prioritize `order.description` if it looks like JSON, as that is the most reliable source (we saved it directly there).
    *   Only fall back to `checkoutInfo` if `description` fails.
    *   Or, try both sequentially until valid data is found.
    *   Add `console.log` to see what `order.description` and `checkoutInfo` actually contain.

Let's modify `draft/route.ts` to be more robust.

**Proposed Logic:**
```typescript
let eventDetails = {};

// 1. Try description first (most direct source)
if (order.description && order.description.trim().startsWith('{')) {
  try {
    eventDetails = JSON.parse(order.description);
  } catch (e) {
    console.warn('Failed to parse description as JSON', e);
  }
}

// 2. If empty, try checkoutInfo metadata
if (Object.keys(eventDetails).length === 0) {
  try {
    const checkoutInfo = JSON.parse(order.checkoutInfo || '{}');
    if (checkoutInfo.metadata?.event_draft) {
       // ... parse ...
    }
  } catch (e) { ... }
}
```

This reordering makes sense because `order.description` in the DB is explicitly set to the event draft JSON in `checkout/route.ts` (Line 90). The `checkoutInfo` is derived from the payment provider and is less reliable for our internal data storage.
