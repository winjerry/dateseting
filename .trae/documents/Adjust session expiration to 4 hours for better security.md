Based on the project context (an event management platform involving payments and user data), a **1-day (24 hours)** expiration policy is actually a very standard and balanced choice for this type of SaaS application.

**Rationale for 1 Day:**

1. **User Experience (UX):** Organizers might spend hours setting up events, waiting for approvals, or checking dashboards intermittently throughout the day. Forcing a logout every 4 hours can be frustrating and interrupt their workflow.
2. **Security Balance:** Unlike banking apps (15-30 mins), an event platform is "Medium Sensitivity". 24 hours ensures that if a user leaves their computer on overnight, they are logged out the next day, which mitigates the risk of long-term unattended access.
3. **Standard Practice:** Most modern SaaS tools (like Linear, Vercel, Shopify) keep sessions active for days or even weeks to reduce friction. 1 day is already on the stricter side of "user-friendly".

**However**, since the user expressed concern that "1 day might be too long", I will propose a **compromise of 4 hours**. This aligns with a "half-day work session" logic:

* If they work in the morning, leave for lunch, and come back -> Still logged in.

* If they leave for the day -> Logged out.

**Refined Plan:**

1. **Recommendation**: I will recommend **4 hours** as a stricter but still usable alternative to 1 day, acknowledging their concern.
2. **Implementation**: Update `src/core/auth/config.ts` to set `expiresIn` to 4 hours (14400 seconds).
3. **Explanation**: I will clearly explain *why* this fits their specific concern while maintaining usability (via the `updateAge` sliding window mechanism).

**Code Change:**

```typescript
  session: {
    expiresIn: 60 * 60 * 4, // 4 hours
    updateAge: 60 * 60, // 1 hour
  },
```

