/**
 * API Route: POST /api/webhook
 *
 * Stripe webhook handler pro zpracovani udalosti po platbe.
 * Po uspesne platbe spusti generovani PDF a odeslani emailu.
 */

import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/services/stripe'
import { generateItineraryPdf } from '@/services/pdf'
import { sendItineraryEmail } from '@/services/resend'
import type { UserPreferences } from '@/types'

// Disable body parsing - potrebujeme raw body pro signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    // Ziskani raw body a signature
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Validace webhook signature
    const event = constructWebhookEvent(body, signature)

    // Zpracovani udalosti
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // Extrakce metadat
        const metadata = session.metadata || {}
        const email = metadata.email || session.customer_email
        const tripId = metadata.tripId
        const preferences: UserPreferences = metadata.preferences
          ? JSON.parse(metadata.preferences)
          : {}

        if (!email || !tripId) {
          console.error('Missing email or tripId in metadata')
          return NextResponse.json(
            { error: 'Missing required metadata' },
            { status: 400 }
          )
        }

        console.log(`Processing order for ${email}, trip: ${tripId}`)
        console.log('Preferences:', preferences)

        try {
          // 1. Vygenerovat PDF itinerar
          const pdfBuffer = await generateItineraryPdf({
            tripId,
            email,
            preferences,
          })

          // 2. Odeslat email s PDF
          await sendItineraryEmail({
            to: email,
            tripId,
            pdfBuffer,
          })

          console.log(`Successfully processed order for ${email}`)
        } catch (fulfillmentError) {
          console.error('Fulfillment error:', fulfillmentError)
          // Nevracime chybu - Stripe by webhook opakoval
          // Misto toho logujeme a pripadne alertujeme
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.error(
          `Payment failed for ${paymentIntent.id}:`,
          paymentIntent.last_payment_error?.message
        )
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)

    // Pokud je to chyba signature, vratime 400
    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
