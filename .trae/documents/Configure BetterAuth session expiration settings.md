Based on the user's request, they want to enforce session expiration. The current session seems to persist indefinitely (or at least for too long), allowing access to protected pages like "My Events" even after a day.

**The Solution:**
I need to explicitly configure the session expiration in `src/core/auth/config.ts` using BetterAuth's `session` configuration object.

**Steps:**
1.  **Modify `src/core/auth/config.ts`**:
    *   Update the `authOptions` object to include a `session` property.
    *   Set `expiresIn` to a reasonable duration. The user mentioned "should have a certain time cache", implying a shorter duration than the default (which is usually 7-30 days). I will set it to **1 day (86400 seconds)** as a reasonable security measure, or perhaps **1 hour** if strict security is needed, but 1 day is a good balance for a standard web app.
    *   Set `updateAge` to ensure the session is refreshed if the user is active.
    *   Disable `cookieCache` or set a short `maxAge` to ensure the server validates the session status against the database frequently (this helps with the "user performs any operation" check).

2.  **Configuration Details**:
    *   `expiresIn`: 60 * 60 * 24 (1 day) - Session is valid for 1 day.
    *   `updateAge`: 60 * 60 (1 hour) - If user is active, extend session every hour.

**Code Change**:
I will insert the `session` config block into the `authOptions` constant in `src/core/auth/config.ts`.

```typescript
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60, // 1 hour
  },
```

This will ensure that if a user comes back after more than 1 day of inactivity, their session will be invalid, and they will be forced to log in again.
