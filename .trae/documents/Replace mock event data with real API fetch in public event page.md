Based on the user's issue and my analysis, the public event page (`src/app/[locale]/e/[eventNo]/page.tsx`) is currently displaying **mock data** (`MOCK_EVENT`) instead of fetching the real event details from the server using the `eventNo` parameter.

**Analysis:**
1.  **Current Code**: The file defines `MOCK_EVENT` and uses it directly. It extracts `eventNo` from params but doesn't use it for data fetching.
2.  **Required Change**: I need to replace the mock data with a real API call to `/api/events/public?eventNo=${eventNo}`.
3.  **API Availability**: I previously confirmed that `src/app/api/events/public/route.ts` exists and handles `eventNo` queries.

**Plan:**
1.  **Modify `src/app/[locale]/e/[eventNo]/page.tsx`**:
    -   Add `useEffect` to fetch event data when `eventNo` changes.
    -   Add `useState` to store the `event` data and `loading` / `error` states.
    -   Replace usage of `MOCK_EVENT` with the state variable `event`.
    -   Handle loading state (show a spinner or skeleton).
    -   Handle error state (show "Event not found" or similar).
    -   Ensure the API response structure matches what the UI expects (adapt fields if necessary).

**API Response Structure Check:**
I should quickly verify the response structure of `/api/events/public` to ensure I map the fields correctly (e.g., `eventDate`, `eventTime`, `location`, `name`, `description`).

**Refined Plan:**
1.  Read `src/app/api/events/public/route.ts` to confirm the JSON response structure.
2.  Update `src/app/[locale]/e/[eventNo]/page.tsx` to fetch data.

Let's do this.
