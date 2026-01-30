import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 className="high-contrast-text mb-4">
          TripRadar Sever
        </h1>
        <p className="max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
          Personalizovaný průvodce výletovými zážitky na Bílinsku.
          Objevte tajemství Bořeně.
        </p>
      </div>

      <nav className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/configure"
          className="block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          Sestavit výlet
        </Link>

        <Link
          href="/radar"
          className="block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all"
          style={{
            backgroundColor: 'var(--color-history)',
            color: 'white',
          }}
        >
          Radar navigace
        </Link>

        <Link
          href="/checkout/success"
          className="block w-full py-3 px-6 text-center font-medium rounded-xl border-2 transition-all"
          style={{
            borderColor: 'var(--color-foreground)',
            color: 'var(--color-foreground)',
          }}
        >
          Ukázka: Po zaplacení
        </Link>
      </nav>
    </main>
  )
}
