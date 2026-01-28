/**
 * API Route: POST /api/checkout
 *
 * Vytvori Stripe Checkout session a vrati URL pro presmerovani.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/services/stripe'
import type { UserPreferences } from '@/types'

// Dostupne vylety (stejne jako v ConfigureForm)
const TRIPS: Record<string, { name: string; price: number }> = {
  'borena-tajemstvi': {
    name: 'Tajemství Bořeně',
    price: 149,
  },
}

interface CheckoutRequest {
  tripId: string
  email: string
  preferences: UserPreferences
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()

    // Validace vstupu
    if (!body.tripId || !body.email || !body.preferences) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      )
    }

    // Validace emailu
    if (!body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Neplatný email' },
        { status: 400 }
      )
    }

    // Kontrola existence vyletu
    const trip = TRIPS[body.tripId]
    if (!trip) {
      return NextResponse.json(
        { error: 'Výlet nenalezen' },
        { status: 404 }
      )
    }

    // Vytvoreni Stripe Checkout session
    const session = await createCheckoutSession({
      tripId: body.tripId,
      tripName: trip.name,
      price: trip.price,
      email: body.email,
      preferences: body.preferences,
    })

    // Vracime URL pro presmerovani
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)

    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit platbu' },
      { status: 500 }
    )
  }
}
