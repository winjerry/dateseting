Based on the user's terminal error, the payment process failed because of a foreign key constraint violation:
`insert or update on table "order" violates foreign key constraint "order_user_id_user_id_fk"`

This means the `user_id` being inserted into the `order` table does NOT exist in the `user` table.

This is a classic "stale session" or "data inconsistency" issue, especially in a development environment where the database might have been reset or user data deleted, but the browser (client) still holds an old session cookie with a user ID that no longer exists in the DB.

**Plan:**

1.  **Verify User Existence (Defensive Programming):**
    *   In `src/app/api/events/checkout/route.ts`, before creating the order, I will add a check to verify if the user (from `session.user.id`) actually exists in the database.
    *   If the user does not exist, I will return a specific error (e.g., "User not found, please sign in again") and ideally clear the session (though clearing session from an API route might be tricky, returning a 401/403 status is standard).

2.  **Fix Implementation:**
    *   Import `findUserById` from `src/shared/models/user`.
    *   In the `POST` handler, after getting the session, call `findUserById(session.user.id)`.
    *   If the result is null/undefined, return `respErr('User record not found. Please sign out and sign in again.')`.

This will prevent the raw database error (500) and give a meaningful message to the client/user, prompting them to fix their stale session state.

**Why not just "fix the data"?**
I cannot "fix" the missing user data because I don't know what the user's details were. The correct fix is to force the user to re-authenticate so a valid user record is established (or re-established) in the DB.
