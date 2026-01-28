/**
 * RadarClient - Klientska cast Radar stranky
 *
 * Obsahuje stav a logiku pro Radar komponentu.
 */

'use client'

import { useState } from 'react'
import { Radar } from '@/components/radar'
import { Button } from '@/components/ui'
import type { RadarPoint, UserPreferences } from '@/types'

// Mock data pro body zajmu na Boreni
// V produkci by byly nacteny z Supabase
const MOCK_RADAR_POINTS: RadarPoint[] = [
  {
    id: '1',
    tripId: 'borena-tajemstvi',
    name: 'Hradní zřícenina',
    description: 'Zbytky středověkého hradu ze 14. století',
    category: 'history',
    coords: { lat: 50.5456, lng: 13.7811 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '2',
    tripId: 'borena-tajemstvi',
    name: 'Vyhlídka Bilana',
    description: 'Místo spojené s legendou o čarodějnici',
    category: 'history',
    coords: { lat: 50.5462, lng: 13.7825 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '3',
    tripId: 'borena-tajemstvi',
    name: 'Restaurace U Bořeně',
    description: 'Tradiční česká kuchyně s výhledem',
    category: 'food',
    coords: { lat: 50.5430, lng: 13.7790 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '4',
    tripId: 'borena-tajemstvi',
    name: 'Kavárna Bilana',
    description: 'Útulná kavárna s domácími zákusky',
    category: 'food',
    coords: { lat: 50.5425, lng: 13.7805 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '5',
    tripId: 'borena-tajemstvi',
    name: 'Dětské hřiště U Lanovky',
    description: 'Moderní hřiště s lanovým centrem',
    category: 'kids',
    coords: { lat: 50.5415, lng: 13.7780 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '6',
    tripId: 'borena-tajemstvi',
    name: 'Naučná stezka Start',
    description: 'Začátek interaktivní stezky pro děti',
    category: 'kids',
    coords: { lat: 50.5420, lng: 13.7795 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '7',
    tripId: 'borena-tajemstvi',
    name: 'Víkendový trh',
    description: 'Farmářské trhy každou sobotu',
    category: 'event',
    coords: { lat: 50.5410, lng: 13.7770 },
    content: {},
    createdAt: new Date(),
  },
  {
    id: '8',
    tripId: 'borena-tajemstvi',
    name: 'Skalní vyhlídka',
    description: 'Přírodní vyhlídkový bod',
    category: 'nature',
    coords: { lat: 50.5470, lng: 13.7830 },
    content: {},
    createdAt: new Date(),
  },
]

// Vychozi preference (v produkci by byly z order/session)
const DEFAULT_PREFERENCES: UserPreferences = {
  gastro: true,
  history: true,
  kids: false,
  includeWeekendEvents: true,
}

export function RadarClient() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [showSettings, setShowSettings] = useState(false)
  const [reachedCount, setReachedCount] = useState(0)

  const handlePointReached = (point: RadarPoint) => {
    setReachedCount((prev) => prev + 1)
    console.log('Reached point:', point.name)
  }

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-foreground/10">
        <div>
          <h1 className="font-bold text-lg">Radar</h1>
          <p className="text-sm text-text-muted">
            {reachedCount} z {MOCK_RADAR_POINTS.length} bodů
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Zavřít' : 'Filtr'}
        </Button>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="p-4 bg-foreground/5 border-b border-foreground/10">
          <p className="text-sm font-medium mb-3">Zobrazit kategorie:</p>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={preferences.gastro}
              onClick={() => togglePreference('gastro')}
              color="#F59E0B"
            >
              Gastro
            </FilterButton>
            <FilterButton
              active={preferences.history}
              onClick={() => togglePreference('history')}
              color="#8B5CF6"
            >
              Historie
            </FilterButton>
            <FilterButton
              active={preferences.kids}
              onClick={() => togglePreference('kids')}
              color="#10B981"
            >
              Pro děti
            </FilterButton>
            <FilterButton
              active={preferences.includeWeekendEvents}
              onClick={() => togglePreference('includeWeekendEvents')}
              color="#EC4899"
            >
              Akce
            </FilterButton>
          </div>
        </div>
      )}

      {/* Radar */}
      <div className="flex-1 overflow-hidden">
        <Radar
          points={MOCK_RADAR_POINTS}
          preferences={preferences}
          onPointReached={handlePointReached}
        />
      </div>
    </main>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  color: string
  children: React.ReactNode
}

function FilterButton({ active, onClick, color, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-150
        ${
          active
            ? 'text-white'
            : 'bg-foreground/10 text-text-muted'
        }
      `}
      style={{
        backgroundColor: active ? color : undefined,
      }}
    >
      {children}
    </button>
  )
}
