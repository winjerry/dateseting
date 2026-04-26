Based on the user's request, I will implement an "Edit" feature for draft events. This allows users to modify event details (stored in the draft order) before proceeding to payment, maintaining a consistent flow with creating a new event.

**Current State:**
- My Events page lists draft events (which are actually pending orders).
- Draft events currently have a "Pay Now" button that redirects to the checkout URL.
- The `CreateEventPage` (`/my-events/create`) already supports editing via `?id=xxx` query param, but it fetches from `/api/events/${id}`. Since drafts are *orders*, not *events* (in the `event` table), this API call will fail for drafts.

**The Plan:**
1.  **Update My Events Page (`src/app/[locale]/(organizer)/my-events/page.tsx`)**:
    - Add an "Edit" button for draft events.
    - This button will navigate to `/my-events/create?draftId=${event.orderNo}` (using `orderNo` to identify the draft).

2.  **Update Create Event Page (`src/app/[locale]/(organizer)/my-events/create/page.tsx`)**:
    - Modify the `useEffect` to check for `draftId` in `searchParams`.
    - If `draftId` is present:
        - Fetch the draft order details from a new API endpoint (or reuse an existing one if suitable, but likely need a specific way to get draft details).
        - Actually, I can reuse `/api/events/list` or create a specific fetcher, but a cleaner way is to fetch the order details.
        - Wait, the user data is stored in the `order` table's `checkoutInfo` or `description`.
    - I will implement a fetch logic: `fetch('/api/events/draft?orderNo=' + draftId)`.

3.  **Create/Update API for Fetching Draft (`src/app/api/events/draft/route.ts`)**:
    - Create a new route (or use an existing one) to fetch draft details by `orderNo`.
    - It should read the `order` table, parse `checkoutInfo`/`description`, and return the form data structure expected by `CreateEventPage`.

4.  **Flow**:
    - User clicks "Edit" on My Events.
    - Redirects to Create Page with draft ID.
    - Create Page loads draft data.
    - User edits and submits.
    - Submit logic needs to update the *existing* draft order instead of creating a new one (or just create a new one and let the old one stay pending? Better to update or create new order with updated details).
    - Actually, the simplest flow is: User edits -> Submit -> Saves to `sessionStorage` -> Redirects to Confirm Page.
    - Confirm Page -> "Proceed to Payment" -> Creates a *new* checkout session (updating the order or creating a new order).
    - To keep it simple and robust: The "Edit" flow will effectively restart the checkout process with pre-filled data. The old draft order will remain as a "stale" pending order (which is fine, they eventually get cleaned up or ignored). Or, ideally, we update the existing order.

**Refined Plan for Step 2 & 3 (Simpler Approach):**
- Instead of a new API, I can pass the draft data via `sessionStorage` if the user clicks "Edit". But `sessionStorage` is client-side and transient.
- Better: Fetch the draft from the server.
- I'll create `src/app/api/events/draft/route.ts` to get order details.
- `CreateEventPage` will load this data.
- When submitting, it goes to `confirm` page.
- `ConfirmPage` will initiate checkout.
- **Crucial**: To avoid duplicate drafts, we should probably update the existing order if possible, or just treat it as a new attempt. Given the current `checkout` logic creates a new `orderNo`, treating it as a "new attempt based on old draft" is safer and easier. The old draft will just sit there (unpaid).

**Wait, the user said "Edit ... then pay"**:
- If I create a new order, the old "Draft" item in My Events will still be there.
- So, ideally, when they "Edit" and then "Pay", we should update the *same* draft order if possible, or at least the UX should feel like it.
- However, since `orderNo` is unique and tied to payment sessions, creating a new order is technically cleaner for the payment provider.
- I will implement the "Clone/Edit" flow: Fetch draft -> Pre-fill Form -> User Submits -> New Checkout -> New Order. The old draft remains until they pay the new one (then maybe we can hide old drafts? No, keep it simple).

**Action Items:**
1.  Create `src/app/api/events/draft/route.ts` to fetch draft event details by `orderNo`.
2.  Update `MyEventsDashboard` to add "Edit" button linking to `/my-events/create?draftId=...`.
3.  Update `CreateEventPage` to fetch data if `draftId` exists.

Let's start.
