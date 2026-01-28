/**
 * useVibration - Hook pro haptickou odezvu
 *
 * Poskytuje vibracni feedback podle vzdalenosti k cili.
 * Vzor vibraci:
 * - > 100m: zadna vibrace
 * - 50-100m: 1 pulz za 2s
 * - < 50m: 2 pulzy za 1s
 * - Dosazeni cile: dlouhy pulz
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type VibrationPattern = 'none' | 'far' | 'close' | 'veryClose' | 'arrived'

interface UseVibrationOptions {
  enabled?: boolean
}

// Vibracni vzory (ms)
const VIBRATION_PATTERNS: Record<VibrationPattern, number[]> = {
  none: [],
  far: [100], // 1 kratky pulz
  close: [100, 100, 100], // 2 pulzy
  veryClose: [100, 50, 100, 50, 100], // 3 rychle pulzy
  arrived: [200, 100, 400], // Dlouhy slavnostni pulz
}

// Intervaly opakovani (ms)
const REPEAT_INTERVALS: Record<VibrationPattern, number> = {
  none: 0,
  far: 2000, // kazdych 2s
  close: 1000, // kazdou 1s
  veryClose: 500, // kazdych 0.5s
  arrived: 0, // neopakovat
}

export function useVibration(options: UseVibrationOptions = {}) {
  const { enabled = true } = options
  const [isSupported, setIsSupported] = useState(false)
  const [currentPattern, setCurrentPattern] = useState<VibrationPattern>('none')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Kontrola podpory vibrace
  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'vibrate' in navigator)
  }, [])

  // Zakladni vibracni funkce
  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!isSupported || !enabled) return false
      return navigator.vibrate(pattern)
    },
    [isSupported, enabled]
  )

  // Zastaveni vibrace
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (isSupported) {
      navigator.vibrate(0)
    }
    setCurrentPattern('none')
  }, [isSupported])

  // Spusteni vzoru podle vzdalenosti
  const vibrateByDistance = useCallback(
    (distanceMeters: number) => {
      if (!enabled || !isSupported) return

      let newPattern: VibrationPattern

      if (distanceMeters <= 10) {
        newPattern = 'arrived'
      } else if (distanceMeters <= 50) {
        newPattern = 'veryClose'
      } else if (distanceMeters <= 100) {
        newPattern = 'close'
      } else {
        newPattern = 'none'
      }

      // Pokud je stejny vzor, nedelej nic
      if (newPattern === currentPattern && newPattern !== 'arrived') {
        return
      }

      // Zastav predchozi vzor
      stop()
      setCurrentPattern(newPattern)

      if (newPattern === 'none') return

      // Spust vibrace
      const pattern = VIBRATION_PATTERNS[newPattern]
      vibrate(pattern)

      // Nastav opakovani (pokud neni 'arrived')
      const interval = REPEAT_INTERVALS[newPattern]
      if (interval > 0) {
        intervalRef.current = setInterval(() => {
          vibrate(pattern)
        }, interval)
      }
    },
    [enabled, isSupported, currentPattern, stop, vibrate]
  )

  // Jednorázové vibrace
  const vibrateOnce = useCallback(
    (pattern: VibrationPattern = 'close') => {
      if (!enabled || !isSupported) return
      vibrate(VIBRATION_PATTERNS[pattern])
    },
    [enabled, isSupported, vibrate]
  )

  // Cleanup pri unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(0)
      }
    }
  }, [])

  return {
    isSupported,
    currentPattern,
    vibrate,
    vibrateByDistance,
    vibrateOnce,
    stop,
  }
}
