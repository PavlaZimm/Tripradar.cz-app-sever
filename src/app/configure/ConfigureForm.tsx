/**
 * ConfigureForm - Multi-step formular pro konfiguraci vyletu
 *
 * Kroky:
 * 1. Vyber preferencí (gastro, historie, deti, vikendove akce)
 * 2. Email a souhrn
 * 3. Presmerovani na Stripe checkout
 */

'use client'

import { useState, useCallback } from 'react'
import { Button, Card, CardContent, Toggle, Input } from '@/components/ui'
import type { UserPreferences } from '@/types'

type Step = 'preferences' | 'contact' | 'summary'

interface FormData {
  preferences: UserPreferences
  email: string
  tripId: string
}

const INITIAL_PREFERENCES: UserPreferences = {
  gastro: true,
  history: true,
  kids: false,
  includeWeekendEvents: true,
}

// Dostupne vylety (prozatim hardcoded)
const TRIPS = [
  {
    id: 'borena-tajemstvi',
    name: 'Tajemství Bořeně',
    description: 'Objevte legendy čarodějnice Bilany a kněžny Bořeny',
    price: 149,
  },
]

export function ConfigureForm() {
  const [step, setStep] = useState<Step>('preferences')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    preferences: INITIAL_PREFERENCES,
    email: '',
    tripId: TRIPS[0].id,
  })

  const selectedTrip = TRIPS.find((t) => t.id === formData.tripId) || TRIPS[0]

  const updatePreference = useCallback(
    (key: keyof UserPreferences, value: boolean) => {
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value },
      }))
    },
    []
  )

  const handleNext = useCallback(() => {
    if (step === 'preferences') {
      setStep('contact')
    } else if (step === 'contact') {
      if (!formData.email || !formData.email.includes('@')) {
        setError('Zadejte platný email')
        return
      }
      setError(null)
      setStep('summary')
    }
  }, [step, formData.email])

  const handleBack = useCallback(() => {
    if (step === 'contact') {
      setStep('preferences')
    } else if (step === 'summary') {
      setStep('contact')
    }
  }, [step])

  const handleCheckout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: formData.tripId,
          email: formData.email,
          preferences: formData.preferences,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Něco se pokazilo')
      }

      // Presmerovani na Stripe checkout
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo')
      setIsLoading(false)
    }
  }, [formData])

  // Progress indikator
  const stepIndex = step === 'preferences' ? 0 : step === 'contact' ? 1 : 2
  const progress = ((stepIndex + 1) / 3) * 100

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indikator */}
      <div className="flex justify-between text-sm text-text-muted">
        <span className={step === 'preferences' ? 'text-primary font-medium' : ''}>
          1. Zájmy
        </span>
        <span className={step === 'contact' ? 'text-primary font-medium' : ''}>
          2. Kontakt
        </span>
        <span className={step === 'summary' ? 'text-primary font-medium' : ''}>
          3. Souhrn
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-error/10 border-2 border-error rounded-xl text-error text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Preferences */}
      {step === 'preferences' && (
        <Card variant="outlined" padding="lg">
          <CardContent>
            <h2 className="text-lg font-bold mb-4">Co vás zajímá?</h2>
            <div className="space-y-3">
              <Toggle
                label="Gastro tipy"
                description="Restaurace, kavárny a místní speciality"
                checked={formData.preferences.gastro}
                onCheckedChange={(v) => updatePreference('gastro', v)}
              />
              <Toggle
                label="Historie a legendy"
                description="Příběhy, památky a zajímavá místa"
                checked={formData.preferences.history}
                onCheckedChange={(v) => updatePreference('history', v)}
              />
              <Toggle
                label="Aktivity pro děti"
                description="Hřiště, zábava a family-friendly tipy"
                checked={formData.preferences.kids}
                onCheckedChange={(v) => updatePreference('kids', v)}
              />
              <Toggle
                label="Víkendové akce"
                description="Aktuální události a festivaly v regionu"
                checked={formData.preferences.includeWeekendEvents}
                onCheckedChange={(v) => updatePreference('includeWeekendEvents', v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Contact */}
      {step === 'contact' && (
        <Card variant="outlined" padding="lg">
          <CardContent>
            <h2 className="text-lg font-bold mb-4">Kam poslat itinerář?</h2>
            <Input
              label="Email"
              type="email"
              placeholder="vas@email.cz"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              helperText="Na tento email vám pošleme PDF s itinerářem"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Summary */}
      {step === 'summary' && (
        <Card variant="elevated" padding="lg">
          <CardContent>
            <h2 className="text-lg font-bold mb-4">Souhrn objednávky</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{selectedTrip.name}</p>
                  <p className="text-sm text-text-muted">
                    {selectedTrip.description}
                  </p>
                </div>
                <p className="text-xl font-bold">{selectedTrip.price} Kč</p>
              </div>

              <hr className="border-foreground/10" />

              <div>
                <p className="text-sm font-medium text-text-muted mb-2">
                  Vybrané zájmy:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.gastro && (
                    <span className="px-3 py-1 bg-food/20 text-food rounded-full text-sm font-medium">
                      Gastro
                    </span>
                  )}
                  {formData.preferences.history && (
                    <span className="px-3 py-1 bg-history/20 text-history rounded-full text-sm font-medium">
                      Historie
                    </span>
                  )}
                  {formData.preferences.kids && (
                    <span className="px-3 py-1 bg-kids/20 text-kids rounded-full text-sm font-medium">
                      Pro děti
                    </span>
                  )}
                  {formData.preferences.includeWeekendEvents && (
                    <span className="px-3 py-1 bg-event/20 text-event rounded-full text-sm font-medium">
                      Víkendové akce
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-foreground/10" />

              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Email:</span>
                <span className="font-medium">{formData.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons - Thumb zone */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-foreground/10 safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-3">
          {step !== 'preferences' && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBack}
              className="flex-1"
            >
              Zpět
            </Button>
          )}

          {step !== 'summary' ? (
            <Button size="lg" onClick={handleNext} className="flex-1">
              Pokračovat
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleCheckout}
              isLoading={isLoading}
              className="flex-1"
            >
              Zaplatit {selectedTrip.price} Kč
            </Button>
          )}
        </div>
      </div>

      {/* Spacer pro fixed buttons */}
      <div className="h-24" />
    </div>
  )
}
