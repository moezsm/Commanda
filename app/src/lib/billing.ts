// Billing integration stub — T07-07
// All functions throw NotImplementedError until Stripe is wired

class NotImplementedError extends Error {
  constructor(method: string) {
    super(`Billing.${method} is not yet implemented. Add STRIPE_SECRET_KEY to .env.local and implement before going live.`)
    this.name = 'NotImplementedError'
  }
}

export type CheckoutSessionResult = {
  url: string
  sessionId: string
}

/**
 * Create a Stripe Checkout session for workspace premium upgrade.
 * @param workspaceId - The workspace being upgraded
 * @param priceId - Stripe Price ID for the plan
 * @param successUrl - Redirect after successful payment
 * @param cancelUrl - Redirect on cancellation
 */
export async function createCheckoutSession(
  _workspaceId: string,
  _priceId: string,
  _successUrl: string,
  _cancelUrl: string
): Promise<CheckoutSessionResult> {
  void _workspaceId
  void _priceId
  void _successUrl
  void _cancelUrl
  throw new NotImplementedError('createCheckoutSession')
}

/**
 * Handle incoming Stripe webhook event.
 * Updates workspace plan_tier and subscription rows based on event type.
 */
export async function handleWebhook(_rawBody: string, _signature: string): Promise<void> {
  void _rawBody
  void _signature
  throw new NotImplementedError('handleWebhook')
}

/**
 * Cancel an active subscription for a workspace.
 */
export async function cancelSubscription(_workspaceId: string): Promise<void> {
  void _workspaceId
  throw new NotImplementedError('cancelSubscription')
}
