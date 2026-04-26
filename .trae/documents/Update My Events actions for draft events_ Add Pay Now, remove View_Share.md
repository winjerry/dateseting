Based on the user's feedback, showing "View" and "Share" buttons for unpaid (draft) events is confusing and functionally incorrect, as these events are not yet public or fully created.

**Reasonable Actions for Unpaid Events:**
For an event that is in `DRAFT` (unpaid) status, the most logical actions are:
1.  **Continue Payment (Pay Now)**: The user likely wants to finish the process they started. We should provide a button to redirect them to the checkout URL.
2.  **Delete/Cancel**: If they created it by mistake or changed their mind, they should be able to remove the draft.

**The Plan:**
1.  **Modify `MyEventsDashboard` Component (`src/app/[locale]/(organizer)/my-events/page.tsx`)**:
    *   Update the rendering logic for the action buttons.
    *   Check `event.status` or `event.isDraft`.
    *   **If Draft**:
        *   Show a **"Pay Now"** (or "Continue Payment") button. Clicking this should redirect to `event.checkoutUrl` (if available) or trigger the payment modal flow again. Since we merged draft orders which have `checkoutUrl`, we should use that.
        *   Show a **"Delete"** button to remove the draft order (optional but good UX, I'll focus on Pay Now first as primary).
        *   Hide "View" and "Share".
    *   **If Active/Paid**:
        *   Keep the existing "View" and "Share" buttons.

**Technical Details:**
*   In the API response (from the previous step), I mapped the draft order's `checkoutUrl` to the event object? Let me check.
*   I need to double-check if I included `checkoutUrl` in the mapped draft event object in `/api/events/list`. If not, I need to add it.
*   Then in the frontend, use `window.location.href = event.checkoutUrl` for the "Pay Now" action.

**Step 1: Verify API Response**
I need to check `src/app/api/events/list/route.ts` to ensure `checkoutUrl` is being returned for draft events.

**Step 2: Update Frontend**
Modify the button rendering logic.

Let's start by checking the API route again to ensure we are passing the `checkoutUrl`.
