/**
 * Checkout Cancel Page - Zrusena platba
 *
 * Zobrazuje se kdyz uzivatel zrusi platbu na Stripe.
 */

import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'

export const metadata = {
  title: 'Platba zrušena | TripRadar',
  description: 'Vaše platba byla zrušena',
}

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <CardContent>
          {/* Cancel icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-foreground/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Platba zrušena
          </h1>

          <p className="text-text-secondary mb-6">
            Vaše platba byla zrušena. Žádné peníze nebyly strženy z vašeho účtu.
          </p>

          <p className="text-sm text-text-muted mb-6">
            Pokud máte jakékoli dotazy nebo narazili jste na problém, neváhejte
            nás kontaktovat.
          </p>

          <div className="space-y-3">
            <Link href="/configure" className="block">
              <Button size="lg" className="w-full">
                Zkusit znovu
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
