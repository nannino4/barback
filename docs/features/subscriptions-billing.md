# Subscriptions and Billing

Barback organizations are subscription-backed. The MVP billing model uses Stripe
with a 90-day frictionless first trial and a yearly paid plan.

## Product rules

- Each active or trialing subscription allows the owner to create one
  organization.
- The first eligible subscription starts with a 90-day trial and does not require
  a payment method up front.
- If a trial ends without a valid payment method, access is gated until the owner
  assigns a payment method and resumes/reactivates.
- Users can save multiple payment methods.
- A user can set a customer-level default payment method.
- Owners can choose which saved payment method pays for each organization
  subscription.
- Personal payment settings are native in Barback; Stripe Customer Portal is not
  used for the MVP.

## Organization creation paths

### Trial-eligible path

1. User starts organization creation.
2. Backend confirms trial eligibility.
3. Trial subscription is created without collecting a card.
4. Organization is created and linked to that subscription.
5. UI shows trial status and prompts the owner to add a payment method before
   trial end.

### Paid path

1. User is not trial eligible or chooses the paid path.
2. Frontend uses Stripe Elements/Express Checkout for payment setup.
3. Stripe confirms payment/setup.
4. Backend creates/syncs the subscription and organization.
5. UI routes to organization inventory/settings.

## Payment method management

### Organization payment method

In organization settings, owners can:

- view the current subscription payment method;
- choose an existing saved method;
- add a new method via SetupIntent;
- optionally set a card as the customer default;
- preview due-now amount and recurring period before resuming a paused
  subscription.

### Personal payment settings

In the user profile, users should be able to:

- list all saved customer payment methods;
- add a new method;
- set the default method;
- remove methods with confirmation.

When removing a method used by one or more organization subscriptions, the UI
must show affected venues/subscriptions and warn that renewals may fail,
subscriptions may become past due, or trial-end subscriptions may pause if no
valid replacement/default exists.

## Access control

`OrgSubscriptionGuard` restricts organization features to active/trialing or
otherwise allowed subscription states. Paused/past-due/canceled behavior should
be explicit and user-recoverable where possible.

## Important backend endpoints

Examples include:

- `POST /api/subscriptions/trial`
- `GET /api/subscriptions/trial-eligibility`
- `GET /api/subscriptions/:id/resume-preview`
- `POST /api/subscriptions/:id/payment-method`
- `GET /api/payment/methods`
- `POST /api/payment/setup-intent`
- `POST /api/payment/methods`
- `POST /api/payment/methods/default`
- `DELETE /api/payment/methods/:paymentMethodId`
- `POST /api/webhooks/stripe`

Confirm exact DTOs and statuses in backend code before changing clients.

## Future work

- Account-level payment settings completion.
- Better failed-payment and SCA recovery states.
- Subscription cancellation UX.
- More billing lifecycle emails.
- Production Stripe dashboard/webhook checklist.
