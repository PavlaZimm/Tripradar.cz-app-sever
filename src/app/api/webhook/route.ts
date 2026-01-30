/**
 * API Route: POST /api/webhook
 *
 * DEMO verze - placeholder pro Stripe webhook.
 * Pro produkci přidej Stripe webhook handling.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // DEMO: Pouze logujeme
  console.log('Webhook received (demo mode)')

  return NextResponse.json({ received: true })
}
