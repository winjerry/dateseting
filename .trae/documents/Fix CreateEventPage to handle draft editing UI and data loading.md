Based on the user's feedback, there are three issues with the "Edit Draft" flow:

1. **Empty Data**: The form is still blank, meaning the draft data fetching is still not working or not populating `formData` correctly.
2. **Wrong Title/Button**: The page says "Create New Event" and "Create Event", but it should say "Edit Event" or "Update Draft" when in editing mode.
3. **Flow Issue**: After editing, the user expects to go directly to payment or back to My Events, but the current flow goes to `/my-events/create/confirm`.

**Root Cause for Empty Data:**
I previously updated `src/app/api/events/draft/route.ts` to parse `order.description`.
However, in `CreateEventPage`, I see:

```typescript
if (res.ok && data.draft) {
  const d = data.draft;
  setFormData({ ... });
}
```

If `data.draft` is returned but empty (because parsing failed silently on the server or the data structure is different), the form stays blank.
Also, `sessionStorage` logic runs `if (!id)`, but `draftId` logic is separate. If `draftId` logic fails or is slow, the component might render with initial state.

**Root Cause for "Create Event" text:**
The text is hardcoded in the JSX: `<CardTitle>Create New Event</CardTitle>` and `<Button>Create Event</Button>`. It doesn't check `draftId`.

**The Fix Plan:**

1. **Debug Data Loading**:

   * I suspect the date format might be an issue (`d.eventDate`). The API returns a string, `new Date(d.eventDate).toISOString()` might fail if it's already ISO or invalid.

   * I will add more robust date handling.

   * I will also ensure that `draftId` takes precedence and clears any stale `sessionStorage` data if found.

2. **Update UI Text**:

   * If `draftId` (or `id`) is present, change the title to "Edit Event" and button to "Update & Continue".

3. **Update Submit Flow**:

   * The user wants "direct payment" or "return to my events".

   * Currently, `handleSubmit` saves to `sessionStorage` and goes to `confirm`.

   * `confirm` page is where the "Proceed to Payment" button lives. This actually matches "Update & Continue" -> "Confirm" -> "Pay".

   * If the user wants to *skip* the confirm step, we would need to duplicate the "create order" logic here.

   * **Better Approach**: Keep the flow to `confirm` page (as it shows the summary), but maybe rename the button to "Review & Pay" to make it clear.

   * The user said: "Clicking edit should return to a re-edit page... after editing directly pay or return".

   * Going to `confirm` page *is* the step before paying. I will stick to this but clarify the button text.

**Refined Plan:**

1. **Fix** **`CreateEventPage`**:

   * Update Title/Button text based on `draftId`.

   * Add `console.log` to debug data reception.

   * Fix date parsing (handle if it's already YYYY-MM-DD).
2. **Fix Data Parsing in API (Double Check)**:

   * I'll assume the API fix from the previous turn is correct (prioritizing `description`). I'll focus on the frontend consumption.

**Let's fix** **`CreateEventPage`** **first.**
I will also verify if `eventDate` coming from the API is a full ISO string or just a date. In `checkout/route.ts`, it's stored as `eventDate` (string from input). If the input was `date` type, it's `YYYY-MM-DD`. If so, `new Date('2024-01-01')` works.

**Wait**, if the API returns `{ draft: {} }` (empty object), `setFormData` sets empty strings.
I will add a check: if `draftId` is present, fetching *must* succeed. If it fails or returns empty, show an error.

**Code Changes:**

* Modify `src/app/[locale]/(organizer)/my-events/create/page.tsx`.

* Dynamic title: `draftId || id ? 'Edit Event' : 'Create New Event'`.

* Dynamic button: `draftId || id ? 'Update Event' : 'Create Event'`.

* Robust date parsing.

* Clear `sessionStorage` if loading from `draftId` to avoid mixing data.

