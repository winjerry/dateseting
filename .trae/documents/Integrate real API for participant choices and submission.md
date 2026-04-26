Based on the user's request and my analysis, the participant choices page (`src/app/[locale]/e/[eventNo]/choices/page.tsx`) currently uses mock data and logic. The backend API (`src/app/api/participants/choices/route.ts`) is ready to handle both fetching other participants and submitting choices.

**The Plan:**
1.  **Modify `src/app/[locale]/e/[eventNo]/choices/page.tsx`**:
    -   Remove `MOCK_PARTICIPANTS` constant.
    -   Add `useEffect` to fetch participants on mount.
        -   It needs to retrieve the participant token from `localStorage` (which was saved during registration).
        -   Call `GET /api/participants/choices?token=${token}`.
        -   Store the result in `participants` state.
    -   Update `handleSubmit` to use the real API.
        -   Call `POST /api/participants/choices`.
        -   Body: `{ token, choices: selectedIds }`.
    -   Handle loading and error states for the fetch.
    -   Add a check for the token: if no token is found in `localStorage`, redirect the user back to the event page (or register page) because they are not authenticated as a participant.

**Refined Plan:**
1.  Update the component to fetch participants using the stored token.
2.  Update the submission logic to post to the API.

Let's do this.
