Based on the analysis of the current project code and the provided payment integration documentation, here is the optimization plan for the payment confirmation page:

**1. Integrate PaymentModal into ConfirmEventDraftPage**
- **Objective**: Allow users to select a payment method (Stripe, Creem, PayPal) before checkout, instead of relying solely on the default provider.
- **Action**:
    - Import `PaymentModal` from `src/shared/blocks/payment/payment-modal.tsx`.
    - Import `useAppContext` to manage the modal state (`isShowPaymentModal`, `setIsShowPaymentModal`).
    - Add a `handleCheckout` function that accepts the selected payment provider.
    - Update `proceedPayment` to open the modal instead of immediately calling the checkout API.
    - Pass the necessary `pricingItem` structure to `PaymentModal` (mocked from draft data).

**2. Update Checkout Logic to Support Provider Selection**
- **Objective**: Ensure the selected payment provider is passed to the backend API.
- **Action**:
    - Modify the `handleCheckout` function in `ConfirmEventDraftPage` to include `payment_provider` in the request body to `/api/events/checkout`.
    - Update `/api/events/checkout/route.ts` to read `payment_provider` from the request body and use it to get the specific provider instance, instead of defaulting to `configs.default_payment_provider`.

**3. Construct PricingItem for PaymentModal**
- **Objective**: The `PaymentModal` requires a `PricingItem` object.
- **Action**:
    - Create a helper or inline object in `ConfirmEventDraftPage` that maps the `draft` event data (name, price, etc.) to a `PricingItem` structure compatible with `PaymentModal`.
    - Ensure `amount` (in cents) and `currency` are correctly formatted.

**4. Refine Error Handling and UX**
- **Objective**: Provide clear feedback during the payment process.
- **Action**:
    - Ensure `loading` states are correctly managed during the modal interaction and API call.
    - Display error toasts if the checkout URL is missing or the API fails.

This plan aligns with the `pricing.tsx` implementation reference and ensures flexibility for future payment method switches as requested.
