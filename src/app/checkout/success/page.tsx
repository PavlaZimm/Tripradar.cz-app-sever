/**
 * Checkout Success Page - Potvrzeni uspesne platby
 *
 * Zobrazuje se po uspesnem dokonceni platby pres Stripe.
 */

import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'

export const metadata = {
  title: 'Platba dokončena | TripRadar',
  description: 'Vaše platba byla úspěšně zpracována',
}

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <CardContent>
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-success/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Platba dokončena!
          </h1>

          <p className="text-text-secondary mb-6">
            Děkujeme za vaši objednávku. Na váš email brzy dorazí personalizovaný
            itinerář ve formátu PDF.
          </p>

          <div className="bg-background border-2 border-foreground/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-text-muted mb-1">Co bude následovat:</p>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span>Vygenerujeme váš personalizovaný itinerář</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span>Pošleme vám PDF na email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span>Odemkneme vám přístup do aplikace Radar</span>
              </li>
            </ul>
          </div>

          {sessionId && (
            <p className="text-xs text-text-muted mb-4">
              ID transakce: {sessionId.slice(0, 20)}...
            </p>
          )}

          <div className="space-y-3">
            <Link href="/radar" className="block">
              <Button size="lg" className="w-full">
                Otevřít Radar
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" size="lg" className="w-full">
                Zpět na hlavní stránku
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
