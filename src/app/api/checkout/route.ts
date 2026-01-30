/**
 * API Route: POST /api/checkout
 *
 * DEMO verze - presmeruje primo na success stranku bez Stripe.
 * Pro produkci odkomentuj Stripe integraci.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { UserPreferences } from '@/types'

// Dostupne vylety
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

    // DEMO: Presmerovani primo na success (bez Stripe)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const demoSessionId = `demo_${Date.now()}`

    return NextResponse.json({
      url: `${appUrl}/checkout/success?session_id=${demoSessionId}`
    })
  } catch (error) {
    console.error('Checkout error:', error)

    return NextResponse.json(
      { error: 'Něco se pokazilo' },
      { status: 500 }
    )
  }
}
