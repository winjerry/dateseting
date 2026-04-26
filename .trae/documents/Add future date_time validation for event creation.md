Based on the user's request and the code analysis, I need to add validation to ensure that the event date and time are in the future.

**Current State:**
- The form uses `<Input type="date">` and `<Input type="time">` but allows past dates.
- No validation logic in `handleSubmit`.

**The Plan:**
1.  **Frontend Validation (`src/app/[locale]/(organizer)/my-events/create/page.tsx`)**:
    -   In `handleSubmit`, combine `formData.eventDate` and `formData.eventTime` into a `Date` object.
    -   Compare it with `new Date()` (current time).
    -   If the selected time is in the past:
        -   Show an error toast (e.g., "Event date and time must be in the future").
        -   Stop submission.
    -   Also, strictly speaking, setting the `min` attribute on the date input to today's date (`new Date().toISOString().split('T')[0]`) provides a better UX by disabling past dates in the calendar picker.

**Implementation Details:**
-   **Min Date Attribute**: Set `min={new Date().toISOString().split('T')[0]}` on the Date Input.
-   **JS Check**: Since `min` attribute doesn't prevent typing or some browser inconsistencies, and specifically for "today" coupled with a "past time", a JS check is necessary.

**Refined Plan:**
1.  Modify `src/app/[locale]/(organizer)/my-events/create/page.tsx`.
2.  Add `min` attribute to the date input.
3.  Add validation logic at the start of `handleSubmit`.

Let's implement this.
