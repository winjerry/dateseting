I will fix the "No checkout URL received" error which is masking the actual backend error, and ensure a default payment provider is selected if one isn't explicitly configured.

**1. Fix Frontend Error Handling**
- File: `src/app/[locale]/(organizer)/my-events/create/confirm/page.tsx`
- The current code checks `res.ok` (which is true even for business errors) but ignores `data.code`.
- I will add a check: `if (data.code !== 0) throw new Error(data.message);` before checking for `checkoutUrl`.
- This will display the *actual* error message (e.g., "no payment provider configured") to the user.

**2. Fix Backend Provider Selection**
- File: `src/app/api/events/checkout/route.ts`
- Currently, if `default_payment_provider` is not set in configs, `getProvider` returns undefined, even if Stripe is enabled.
- I will modify the route to attempt `paymentManager.getDefaultProvider()` if `paymentManager.getProvider(...)` returns null.
- This ensures that if Stripe is the only enabled provider, it will be used even if not explicitly marked as "default" in the database settings.

**3. Update PaymentManager (Optional but recommended)**
- File: `src/extensions/payment/index.ts`
- I will verify if `getDefaultProvider` logic correctly picks the first available provider. (It does: `if (!this.defaultProvider && this.providers.length > 0) this.defaultProvider = this.providers[0];`)

This two-pronged approach fixes the immediate silent failure and the likely underlying configuration issue.
