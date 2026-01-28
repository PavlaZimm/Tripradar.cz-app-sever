/**
 * Configure Page - Multi-step formular pro konfiguraci vyletu
 *
 * Uzivatel si vybere zajmy (gastro, historie, deti) a prejde k platbe.
 */

import { ConfigureForm } from './ConfigureForm'

export const metadata = {
  title: 'Konfigurace výletu | TripRadar',
  description: 'Přizpůsobte si výlet podle svých zájmů',
}

export default function ConfigurePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sestavte si výlet
          </h1>
          <p className="text-text-secondary">
            Vyberte, co vás zajímá, a my vám připravíme itinerář na míru
          </p>
        </header>

        <ConfigureForm />
      </div>
    </main>
  )
}
