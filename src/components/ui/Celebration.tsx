/**
 * Celebration - Oslavne animace
 *
 * Lottie animace pro uspesne dokonceni akce (checkpoint, odkryti karty).
 * Aktivuje pozitivni emoce a potvrzuje uspech.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamicky import Lottie pro SSR kompatibilitu
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Konfety animace data (inline JSON pro rychle nacteni)
const confettiAnimation = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 400,
  h: 400,
  nm: 'Confetti',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Confetti',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [720] }, { t: 120, s: [720] }] },
        p: {
          a: 1,
          k: [
            { t: 0, s: [200, 50, 0], e: [200, 400, 0] },
            { t: 120, s: [200, 400, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'rc',
          d: 1,
          s: { a: 0, k: [20, 20] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 4 },
          nm: 'Rectangle',
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.96, 0.62, 0.04, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: 'Fill',
        },
      ],
    },
  ],
}

// Uspech/checkpoint animace
const successAnimation = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: 'Success',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Checkmark',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100], e: [120, 120, 100] },
            { t: 20, s: [120, 120, 100], e: [100, 100, 100] },
            { t: 30, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'el',
          s: { a: 0, k: [80, 80] },
          p: { a: 0, k: [0, 0] },
          nm: 'Circle',
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.06, 0.73, 0.51, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: 'Fill',
        },
      ],
    },
  ],
}

type CelebrationType = 'confetti' | 'success' | 'checkpoint'

interface CelebrationProps {
  type?: CelebrationType
  /** Automaticky skryt po animaci */
  autoHide?: boolean
  /** Callback po dokonceni animace */
  onComplete?: () => void
  /** Zobrazit animaci */
  show?: boolean
  /** Velikost animace */
  size?: number
}

export function Celebration({
  type = 'confetti',
  autoHide = true,
  onComplete,
  show = true,
  size = 200,
}: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  const handleComplete = useCallback(() => {
    if (autoHide) {
      setIsVisible(false)
    }
    onComplete?.()
  }, [autoHide, onComplete])

  if (!isVisible) return null

  const animationData =
    type === 'confetti' ? confettiAnimation : successAnimation

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      aria-hidden="true"
    >
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay
        onComplete={handleComplete}
        style={{ width: size, height: size }}
      />
    </div>
  )
}

// Hook pro snadne pouziti oslavnych animaci
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    type: CelebrationType
    show: boolean
  }>({ type: 'confetti', show: false })

  const celebrate = useCallback((type: CelebrationType = 'confetti') => {
    setCelebration({ type, show: true })

    // Vibracni feedback
    if (navigator.vibrate) {
      if (type === 'confetti') {
        navigator.vibrate([100, 50, 100, 50, 200])
      } else {
        navigator.vibrate(100)
      }
    }
  }, [])

  const hide = useCallback(() => {
    setCelebration((prev) => ({ ...prev, show: false }))
  }, [])

  return {
    celebrate,
    hide,
    CelebrationComponent: () => (
      <Celebration
        type={celebration.type}
        show={celebration.show}
        onComplete={hide}
      />
    ),
  }
}
