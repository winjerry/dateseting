Based on the user's feedback, the event registration confirmation page (`src/app/[locale]/e/[eventNo]/success/page.tsx`) displays hardcoded mock data (`MOCK_EVENT`) which does not match the actual event the user registered for.

**The Fix:**
I need to update this page to fetch the real event details from the server using the `eventNo` parameter, similar to how I updated the public event page.

**Plan:**
1.  **Modify `src/app/[locale]/e/[eventNo]/success/page.tsx`**:
    -   Remove `MOCK_EVENT`.
    -   Add `useState` to store `event` data.
    -   Add `useEffect` to fetch event data from `/api/events/public?eventNo=${eventNo}`.
    -   Handle loading state.
    -   Replace the hardcoded display values with `event.name`, `event.eventDate`, `event.eventTime`, `event.location`.

**Note:** The `MOCK_ICEBREAKERS` can likely remain as generic content for now, or I can fetch them from the API if the API returns them (which `src/app/api/events/public/route.ts` does return as `icebreakers`). So I should use the real icebreakers too.

**Refined Plan:**
1.  Update the component to fetch data.
2.  Use the `event` and `icebreakers` from the API response.

Let's do this.
