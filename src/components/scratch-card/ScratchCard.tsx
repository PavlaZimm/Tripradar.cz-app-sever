/**
 * ScratchCard - Digitalni stiraci karta
 *
 * Hrava komponenta, kde uzivatel "setre" prstem cil vyletu.
 * Aktivuje dopaminove drahy spojene s objevovanim.
 */

'use client'

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  TouchEvent,
  MouseEvent,
} from 'react'

interface ScratchCardProps {
  /** Obsah, ktery se objevi po setreni */
  children: React.ReactNode
  /** Sirka karty */
  width?: number
  /** Vyska karty */
  height?: number
  /** Barva stiraci vrstvy */
  coverColor?: string
  /** Velikost stetce */
  brushSize?: number
  /** Procento setreni pro odhaleni (0-100) */
  revealThreshold?: number
  /** Callback po odhaleni */
  onReveal?: () => void
  /** Callback s aktualnim procentem setreni */
  onScratchProgress?: (percentage: number) => void
  /** Custom text na stiraci vrstve */
  coverText?: string
  /** Disabled stav */
  disabled?: boolean
}

export function ScratchCard({
  children,
  width = 300,
  height = 200,
  coverColor = '#1A1A1A',
  brushSize = 40,
  revealThreshold = 50,
  onReveal,
  onScratchProgress,
  coverText = 'Setři a odhal cíl!',
  disabled = false,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isScratching, setIsScratching] = useState(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  // Inicializace canvasu
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Nastaveni velikosti
    canvas.width = width
    canvas.height = height

    // Vykresleni stiraci vrstvy
    ctx.fillStyle = coverColor
    ctx.fillRect(0, 0, width, height)

    // Pridani textu
    ctx.fillStyle = '#F5F5F5'
    ctx.font = 'bold 18px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(coverText, width / 2, height / 2)

    // Pridani ikony prstu
    ctx.font = '32px system-ui'
    ctx.fillText('👆', width / 2, height / 2 + 40)
  }, [width, height, coverColor, coverText])

  // Vypocet procenta setreni
  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0

    const ctx = canvas.getContext('2d')
    if (!ctx) return 0

    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    let transparentPixels = 0

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++
      }
    }

    return (transparentPixels / (width * height)) * 100
  }, [width, height])

  // Stiraci funkce
  const scratch = useCallback(
    (x: number, y: number) => {
      if (disabled || isRevealed) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.globalCompositeOperation = 'destination-out'

      if (lastPointRef.current) {
        // Plynula cara mezi body
        ctx.beginPath()
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
        ctx.lineTo(x, y)
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }

      // Kruh na aktualni pozici
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()

      lastPointRef.current = { x, y }

      // Kontrola procenta setreni
      const percentage = calculateScratchPercentage()
      onScratchProgress?.(percentage)

      if (percentage >= revealThreshold && !isRevealed) {
        setIsRevealed(true)
        onReveal?.()

        // Vibrační feedback při odhalení
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 200])
        }
      }
    },
    [
      brushSize,
      calculateScratchPercentage,
      disabled,
      isRevealed,
      onReveal,
      onScratchProgress,
      revealThreshold,
    ]
  )

  // Ziskani souradnic z eventu
  const getCoordinates = useCallback(
    (
      e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>
    ): { x: number; y: number } | null => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ('touches' in e) {
        const touch = e.touches[0]
        if (!touch) return null
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    []
  )

  // Event handlery
  const handleStart = useCallback(
    (e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      setIsScratching(true)
      const coords = getCoordinates(e)
      if (coords) {
        lastPointRef.current = coords
        scratch(coords.x, coords.y)
      }
    },
    [getCoordinates, scratch]
  )

  const handleMove = useCallback(
    (e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>) => {
      if (!isScratching) return
      e.preventDefault()
      const coords = getCoordinates(e)
      if (coords) {
        scratch(coords.x, coords.y)
      }
    },
    [getCoordinates, isScratching, scratch]
  )

  const handleEnd = useCallback(() => {
    setIsScratching(false)
    lastPointRef.current = null
  }, [])

  return (
    <div
      ref={containerRef}
      className="scratch-card-container relative inline-block rounded-2xl overflow-hidden shadow-xl"
      style={{ width, height }}
    >
      {/* Skryty obsah */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          bg-gradient-to-br from-primary/10 to-accent/10
          p-4 text-center
          transition-opacity duration-500
          ${isRevealed ? 'opacity-100' : 'opacity-100'}
        `}
      >
        {children}
      </div>

      {/* Stiraci vrstva */}
      <canvas
        ref={canvasRef}
        className={`
          absolute inset-0 w-full h-full
          cursor-pointer
          transition-opacity duration-500
          ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Revealed indikator */}
      {isRevealed && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-success text-white text-xs font-bold rounded-full">
          Odhaleno!
        </div>
      )}
    </div>
  )
}
