Based on the user's request, when clicking "Update & Continue" in the edit page, the draft data should be **saved to the database immediately**. This ensures that if the user navigates away or comes back later, the data is persisted on the server, not just in `sessionStorage`.

**Current Behavior:**
1.  **Edit Page (`CreateEventPage`)**: Clicking "Update & Continue" only saves data to `sessionStorage` and redirects to `ConfirmPage`.
2.  **Confirm Page (`ConfirmPage`)**: Clicking "Proceed to Payment" calls `/api/events/checkout` (with `draftId`), which *then* updates the database.
3.  **Problem**: If the user clicks "Update & Continue" -> lands on Confirm Page -> clicks "Back to Edit", they see the data from `sessionStorage`. BUT, if they reload the page or clear cache, or if they check the database, the *actual* order record is NOT updated until they click "Pay". The user wants the DB update to happen *at the edit step*.

**The Solution:**
We need an API endpoint to update the draft order details *without* initiating a full checkout/payment session (or at least update the metadata).
Actually, we can reuse `/api/events/checkout` if we handle it carefully, but `checkout` creates a payment session which might be overkill just for saving a draft.
However, since this is a "Draft" which is technically a "Pending Order", updating the order details (description/metadata) is the correct way.

**Proposed Plan:**
1.  **Create/Update API**: We need an API to update the draft. I can create `src/app/api/events/draft/update/route.ts` OR reuse `POST /api/events/draft`.
    - Let's use `POST /api/events/draft` (currently `GET` exists).
    - This endpoint will receive `draftId` (orderNo) and the new event details.
    - It will update the `order` record's `description` (which holds the JSON) and `checkoutInfo.metadata`.

2.  **Update Frontend (`CreateEventPage`)**:
    - In `handleSubmit`, before redirecting to `confirm`, call this new update API.
    - If successful, *then* save to `sessionStorage` (for speed/redundancy) and redirect.

**Detailed Steps:**
1.  **Create `POST` method in `src/app/api/events/draft/route.ts`**:
    - Validate session.
    - Validate `orderNo`.
    - Update `order` using `updateOrderByOrderNo`.
    - Update `description` with new JSON.
    - Update `checkoutInfo` metadata (need to parse, update, stringify).

2.  **Update `CreateEventPage`**:
    - Modify `handleSubmit`.
    - If `draftId` exists (Edit mode):
        - Call `POST /api/events/draft`.
        - Await success.
    - Then proceed to `sessionStorage` and redirect.

**Wait**, why `POST`? `PUT` or `PATCH` might be more semantically correct, but `POST` is fine. I'll add `POST` to the existing `draft/route.ts`.

**Code Change:**
In `src/app/api/events/draft/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  // ... auth check ...
  const body = await request.json();
  const { orderNo, ...eventData } = body;
  // ... update logic ...
}
```

In `CreateEventPage`:
```typescript
if (isEditing) {
  await fetch('/api/events/draft', {
    method: 'POST',
    body: JSON.stringify({ orderNo: draftId, ...formData })
  });
}
```

This ensures the DB is always in sync with the latest edits.
