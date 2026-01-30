/**
 * Stripe Service - Integrace se Stripe platební bránou
 *
 * Poskytuje funkce pro vytvoreni checkout session a spravu plateb.
 */

import Stripe from 'stripe'

// Lazy initialization - Stripe client se vytvori az pri prvnim pouziti
let stripeClient: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeClient
}

// Typy pro checkout
export interface CheckoutSessionParams {
  tripId: string
  tripName: string
  price: number
  email: string
  preferences: {
    gastro: boolean
    history: boolean
    kids: boolean
    includeWeekendEvents: boolean
  }
}

/**
 * Vytvori Stripe Checkout session s metadaty o preferencich
 */
export async function createCheckoutSession({
  tripId,
  tripName,
  price,
  email,
  preferences,
}: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: tripName,
            description: 'Personalizovaný výletový itinerář',
            images: [`${appUrl}/images/trip-preview.jpg`],
          },
          unit_amount: price * 100, // Stripe ocekava castku v halerich
        },
        quantity: 1,
      },
    ],
    // Metadata pro webhook - obsahuji preference uzivatele
    metadata: {
      tripId,
      email,
      preferences: JSON.stringify(preferences),
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
  })

  return session
}

/**
 * Ziska detaily checkout session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  })
}

/**
 * Validuje Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret)
}
