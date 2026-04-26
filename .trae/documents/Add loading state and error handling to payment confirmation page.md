I will update the `ConfirmEventDraftPage` component to add loading state and error handling to the payment process.

**1. Update `ConfirmEventDraftPage` component**
- File: `src/app/[locale]/(organizer)/my-events/create/confirm/page.tsx`
- Add `loading` state using `useState`.
- Import `Loader2` from `lucide-react` for the loading spinner.
- Import `toast` from `sonner` for error notifications.
- Update `proceedPayment` function:
    - Set `loading` to `true` at the start.
    - Wrap the fetch call in a `try-catch` block.
    - Check `res.ok` and handle errors by showing a toast message.
    - If successful, redirect to `checkoutUrl`.
    - Set `loading` to `false` in `finally` block (or only on error, as success redirects).
- Update the "Proceed to Payment" button to:
    - Be disabled when `loading` is true.
    - Show a spinner when `loading` is true.

This will provide feedback to the user when they click the button and help diagnose why it might be failing (e.g., displaying an error message returned from the API).
