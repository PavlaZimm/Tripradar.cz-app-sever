/**
 * Radar - Hlavni navigacni komponenta
 *
 * Zobrazuje body zajmu na radarovem displeji a vede uzivatele k cilum.
 * Vyuziva geolokaci a vibracni feedback.
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useGeolocation, calculateDistance, formatDistance } from '@/hooks/useGeolocation'
import { useVibration } from '@/hooks/useVibration'
import { useCelebration, Card, Button } from '@/components/ui'
import type { RadarPoint, UserPreferences, Coordinates } from '@/types'

interface RadarProps {
  points: RadarPoint[]
  preferences: UserPreferences
  onPointReached?: (point: RadarPoint) => void
}

// Barvy kategorii
const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B',
  history: '#8B5CF6',
  event: '#EC4899',
  kids: '#10B981',
  nature: '#059669',
}

// Popis kategorii
const CATEGORY_LABELS: Record<string, string> = {
  food: 'Gastro',
  history: 'Historie',
  event: 'Akce',
  kids: 'Pro děti',
  nature: 'Příroda',
}

export function Radar({ points, preferences, onPointReached }: RadarProps) {
  const { position, error, isLoading, isSupported } = useGeolocation()
  const { vibrateByDistance, vibrateOnce, stop: stopVibration } = useVibration()
  const { celebrate, CelebrationComponent } = useCelebration()

  const [selectedPoint, setSelectedPoint] = useState<RadarPoint | null>(null)
  const [reachedPoints, setReachedPoints] = useState<Set<string>>(new Set())

  // Filtrace bodu podle preferenci
  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      switch (point.category) {
        case 'food':
          return preferences.gastro
        case 'history':
          return preferences.history
        case 'kids':
          return preferences.kids
        case 'event':
          return preferences.includeWeekendEvents
        case 'nature':
          return true // Priroda je vzdy zobrazena
        default:
          return true
      }
    })
  }, [points, preferences])

  // Vypocet vzdalenosti k bodum
  const pointsWithDistance = useMemo(() => {
    if (!position) return []

    return filteredPoints
      .map((point) => ({
        ...point,
        distance: calculateDistance(position, point.coords),
      }))
      .sort((a, b) => a.distance - b.distance)
  }, [filteredPoints, position])

  // Nejblizsi bod
  const nearestPoint = pointsWithDistance[0] || null

  // Vibracni feedback podle vzdalenosti
  useEffect(() => {
    if (nearestPoint && !reachedPoints.has(nearestPoint.id)) {
      vibrateByDistance(nearestPoint.distance)

      // Kontrola dosazeni cile (< 10m)
      if (nearestPoint.distance < 10) {
        setReachedPoints((prev) => new Set(prev).add(nearestPoint.id))
        celebrate('confetti')
        onPointReached?.(nearestPoint)
        stopVibration()
      }
    }

    return () => stopVibration()
  }, [nearestPoint, reachedPoints, vibrateByDistance, stopVibration, celebrate, onPointReached])

  // Vypocet pozice bodu na radaru
  const getPointPosition = (
    point: RadarPoint & { distance: number },
    userPosition: Coordinates
  ) => {
    // Smer k bodu (bearing)
    const dLng = point.coords.lng - userPosition.lng
    const y = Math.sin(dLng) * Math.cos(point.coords.lat * Math.PI / 180)
    const x =
      Math.cos(userPosition.lat * Math.PI / 180) *
        Math.sin(point.coords.lat * Math.PI / 180) -
      Math.sin(userPosition.lat * Math.PI / 180) *
        Math.cos(point.coords.lat * Math.PI / 180) *
        Math.cos(dLng)
    const bearing = Math.atan2(y, x)

    // Vzdalenost normalizovana na radar (max 500m = okraj)
    const maxDistance = 500
    const normalizedDistance = Math.min(point.distance / maxDistance, 1)

    // Pozice na radaru (0-100%)
    const radarX = 50 + normalizedDistance * 45 * Math.sin(bearing)
    const radarY = 50 - normalizedDistance * 45 * Math.cos(bearing)

    return { x: radarX, y: radarY }
  }

  if (!isSupported) {
    return (
      <Card variant="outlined" padding="lg" className="text-center">
        <p className="text-error">
          Váš prohlížeč nepodporuje geolokaci. Pro použití Radaru potřebujete
          moderní prohlížeč s podporou GPS.
        </p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="outlined" padding="lg" className="text-center">
        <p className="text-error mb-4">
          {error.code === 1
            ? 'Prosím povolte přístup k poloze pro použití Radaru.'
            : 'Nepodařilo se zjistit vaši polohu.'}
        </p>
        <Button onClick={() => window.location.reload()}>Zkusit znovu</Button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <CelebrationComponent />

      {/* Radar display */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[320px] aspect-square rounded-full bg-foreground/5 border-2 border-foreground/20"
          style={{
            background: `
              radial-gradient(circle at center, transparent 0%, transparent 30%, rgba(37, 99, 235, 0.1) 100%),
              repeating-radial-gradient(circle at center, transparent 0px, transparent 20%, rgba(37, 99, 235, 0.05) 20%, rgba(37, 99, 235, 0.05) 21%)
            `,
          }}
        >
          {/* Radar kruznice */}
          <div className="absolute inset-[25%] rounded-full border border-foreground/10" />
          <div className="absolute inset-[50%] rounded-full border border-foreground/10" />

          {/* Stredovy bod (uzivatel) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg z-10">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
          </div>

          {/* Body zajmu */}
          {position &&
            pointsWithDistance.map((point) => {
              const pos = getPointPosition(point, position)
              const isReached = reachedPoints.has(point.id)
              const color = CATEGORY_COLORS[point.category] || '#6B7280'

              return (
                <button
                  key={point.id}
                  onClick={() => setSelectedPoint(point)}
                  className={`
                    absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2
                    rounded-full border-2 transition-transform
                    ${isReached ? 'opacity-50' : 'hover:scale-125'}
                    ${selectedPoint?.id === point.id ? 'ring-4 ring-white/50 scale-125' : ''}
                  `}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    backgroundColor: color,
                    borderColor: isReached ? '#9CA3AF' : color,
                  }}
                >
                  {isReached && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Info panel - Thumb zone */}
      <div className="p-4 bg-background border-t border-foreground/10 safe-area-pb">
        {selectedPoint ? (
          <Card variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_COLORS[selectedPoint.category],
                    }}
                  />
                  <span className="text-sm text-text-muted">
                    {CATEGORY_LABELS[selectedPoint.category]}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{selectedPoint.name}</h3>
                {selectedPoint.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {selectedPoint.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {position
                    ? formatDistance(
                        calculateDistance(position, selectedPoint.coords)
                      )
                    : '...'}
                </p>
                {reachedPoints.has(selectedPoint.id) && (
                  <span className="text-sm text-success font-medium">
                    Navštíveno ✓
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPoint(null)}
              className="mt-3 w-full"
            >
              Zavřít
            </Button>
          </Card>
        ) : nearestPoint ? (
          <div className="text-center">
            <p className="text-sm text-text-muted mb-1">Nejbližší cíl</p>
            <p className="font-bold text-lg">{nearestPoint.name}</p>
            <p className="text-3xl font-bold text-primary">
              {formatDistance(nearestPoint.distance)}
            </p>
          </div>
        ) : (
          <p className="text-center text-text-muted">
            Žádné body k zobrazení
          </p>
        )}
      </div>

      {/* Legenda */}
      <div className="px-4 pb-4 flex flex-wrap justify-center gap-3">
        {Object.entries(CATEGORY_LABELS)
          .filter(([key]) => {
            if (key === 'food') return preferences.gastro
            if (key === 'history') return preferences.history
            if (key === 'kids') return preferences.kids
            if (key === 'event') return preferences.includeWeekendEvents
            return true
          })
          .map(([key, label]) => (
            <div key={key} className="flex items-center gap-1 text-xs">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[key] }}
              />
              <span className="text-text-muted">{label}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
