/**
 * useGeolocation - Hook pro sledovani polohy uzivatele
 *
 * Poskytuje real-time aktualizace GPS pozice s error handlingem.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Coordinates } from '@/types'

interface GeolocationState {
  position: Coordinates | null
  error: GeolocationPositionError | null
  isLoading: boolean
  isSupported: boolean
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: true,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  })

  const mergedOptions = { ...defaultOptions, ...options }

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      error: null,
      isLoading: false,
    }))
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error,
      isLoading: false,
    }))
  }, [])

  useEffect(() => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    // Ziskani aktualni pozice
    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      mergedOptions
    )

    // Sledovani pozice v realnem case
    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      handleError,
      mergedOptions
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [state.isSupported, updatePosition, handleError])

  // Manualni refresh pozice
  const refresh = useCallback(() => {
    if (!state.isSupported) return

    setState((prev) => ({ ...prev, isLoading: true }))
    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      mergedOptions
    )
  }, [state.isSupported, updatePosition, handleError])

  return {
    ...state,
    refresh,
  }
}

/**
 * Vypocet vzdalenosti mezi dvema body (Haversine formula)
 * Vraci vzdalenost v metrech
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371000 // Polomer Zeme v metrech
  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Formatovani vzdalenosti pro zobrazeni
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}
