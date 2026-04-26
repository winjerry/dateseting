I will replace the mock data in the My Events page with real data fetched from the API.

**1. Create Data Fetching Hook**
- Use `useEffect` to fetch data from `/api/events/list`.
- Add `loading` and `error` states.
- Fetch both `events` list and `stats` data.

**2. Update Component State**
- Replace `MOCK_EVENTS` constant with `events` state variable.
- Replace `MOCK_STATS` constant with `stats` state variable.
- Initialize `stats` with zeros to handle loading state gracefully.

**3. Implement Data Fetching Logic**
- Create `fetchEvents` async function.
- Call `fetch('/api/events/list?includeStats=true')`.
- Parse response and update state.
- Handle API errors with toast notifications.

**4. Update UI Rendering**
- Show a loading spinner or skeleton while fetching data.
- Render the `events` list using the real data structure.
- Render the `stats` cards using the real statistics.
- Handle the empty state (no events found).

**5. Clean Up**
- Remove `MOCK_EVENTS` and `MOCK_STATS` constants.
- Ensure all types match the API response.

This plan directly addresses the user's request to switch from mock data to real database data via the existing API.
