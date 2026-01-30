import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          TripRadar
        </h1>
        <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-foreground)' }}>
          Výlety jinak
        </p>
        <p className="max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Personalizované výletové zážitky. Vyber si, co tě zajímá,
          a my ti připravíme trasu plnou překvapení.
        </p>
      </div>

      <nav className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/configure"
          className="block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FAF8F5',
          }}
        >
          Sestavit výlet
        </Link>

        <Link
          href="/radar"
          className="block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-foreground)',
          }}
        >
          Radar navigace
        </Link>

        <Link
          href="/checkout/success"
          className="block w-full py-3 px-6 text-center font-medium rounded-xl border-2 transition-all hover:bg-foreground/5"
          style={{
            borderColor: 'var(--color-text-muted)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Ukázka: Po zaplacení
        </Link>
      </nav>

      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Cestuj. Objevuj. Zažij.
      </p>
    </main>
  )
}
