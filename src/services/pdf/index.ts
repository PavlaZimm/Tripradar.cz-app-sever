/**
 * PDF Service - Generovani personalizovanych itineraru
 *
 * Pouziva Puppeteer pro renderovani HTML sablony do PDF.
 */

import puppeteer from 'puppeteer'
import type { UserPreferences } from '@/types'

// Mock data pro vylety (v produkci by bylo z Supabase)
const TRIP_DATA: Record<
  string,
  {
    name: string
    description: string
    sections: {
      category: keyof UserPreferences | 'intro'
      title: string
      content: string
    }[]
  }
> = {
  'borena-tajemstvi': {
    name: 'Tajemství Bořeně',
    description: 'Objevte legendy čarodějnice Bilany a kněžny Bořeny',
    sections: [
      {
        category: 'intro',
        title: 'Vítejte na Bořeni',
        content: `
          Hora Bořeň (539 m n. m.) je dominantou Bílinska a skrývá fascinující
          příběhy z dávné historie. Legenda praví, že zde žila čarodějnice Bilana,
          po které dostalo město Bílina své jméno. Podle jiné pověsti je hora
          pojmenována po kněžně Bořeně, která zde měla svůj hrad.
        `,
      },
      {
        category: 'history',
        title: 'Historie a legendy',
        content: `
          <h3>Čarodějnice Bilana</h3>
          <p>Podle staré pověsti žila na hoře mocná čarodějnice Bilana, která
          léčila nemocné a předpovídala budoucnost. Lidé z okolí ji vyhledávali
          pro její moudrost.</p>

          <h3>Kněžna Bořena</h3>
          <p>Jiná legenda vypráví o krásné kněžně Bořeně, která se ukryla na hoře
          před nájezdníky. Na jejím místě pak vznikl hrad, jehož zbytky jsou
          dodnes patrné.</p>

          <h3>Hradní zřícenina</h3>
          <p>Na vrcholu najdete zbytky středověkého hradu ze 14. století.
          Doporučujeme prohlídku s průvodcem, který vám odhalí tajemství
          hradních sklepení.</p>
        `,
      },
      {
        category: 'gastro',
        title: 'Gastro tipy',
        content: `
          <h3>Restaurace U Bořeně</h3>
          <p>Tradiční česká kuchyně s výhledem na horu. Doporučujeme svíčkovou
          a domácí knedlíky. Adresa: Náměstí Míru 12, Bílina</p>

          <h3>Kavárna Bilana</h3>
          <p>Útulná kavárna s domácími zákusky a výbornou kávou. Ideální
          pro odpočinek po túře. Adresa: Bílinská 45, Bílina</p>

          <h3>Pivovar Bílina</h3>
          <p>Místní minipivovar s ochutnávkou. Vyzkoušejte speciál "Bořeňský ležák".
          Otevřeno: Pá-Ne 14:00-22:00</p>
        `,
      },
      {
        category: 'kids',
        title: 'Pro děti',
        content: `
          <h3>Naučná stezka Bořeň</h3>
          <p>Interaktivní stezka s 8 stanovišti. Děti sbírají razítka a na konci
          je čeká diplom "Objevitel Bořeně". Délka: 3 km, vhodné od 5 let.</p>

          <h3>Dětské hřiště U Lanovky</h3>
          <p>Moderní hřiště s lanovým centrem a pískovištěm. Nachází se u dolní
          stanice lanovky na Bořeň.</p>

          <h3>Tip pro rodiče</h3>
          <p>Vezměte s sebou svačinu - na vrcholu je krásná vyhlídka ideální
          pro piknik.</p>
        `,
      },
      {
        category: 'includeWeekendEvents',
        title: 'Aktuální akce',
        content: `
          <h3>Tento víkend</h3>
          <p><strong>Sobota 10:00:</strong> Komentovaná prohlídka hradní zříceniny</p>
          <p><strong>Sobota 14:00:</strong> Workshop výroby bylinkových mastí</p>
          <p><strong>Neděle 9:00:</strong> Ranní jóga na vrcholu Bořeně</p>

          <h3>Připravujeme</h3>
          <p>Festival legend Bořeně - první víkend v květnu</p>
        `,
      },
    ],
  },
}

interface GeneratePdfParams {
  tripId: string
  email: string
  preferences: UserPreferences
}

/**
 * Generuje HTML sablonu pro PDF
 */
function generateHtmlTemplate(
  tripId: string,
  email: string,
  preferences: UserPreferences
): string {
  const trip = TRIP_DATA[tripId]

  if (!trip) {
    throw new Error(`Trip ${tripId} not found`)
  }

  // Filtrace sekci podle preferenci
  const filteredSections = trip.sections.filter((section) => {
    if (section.category === 'intro') return true
    return preferences[section.category as keyof UserPreferences]
  })

  const sectionsHtml = filteredSections
    .map(
      (section) => `
      <section class="section">
        <h2>${section.title}</h2>
        <div class="content">${section.content}</div>
      </section>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <title>${trip.name} - TripRadar</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #1A1A1A;
          background: #F5F5F5;
          padding: 40px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563EB;
        }

        .header h1 {
          font-size: 32px;
          color: #2563EB;
          margin-bottom: 8px;
        }

        .header p {
          font-size: 16px;
          color: #6B7280;
        }

        .meta {
          background: #E5E7EB;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 32px;
          font-size: 14px;
        }

        .meta strong {
          color: #2563EB;
        }

        .section {
          background: white;
          padding: 24px;
          margin-bottom: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .section h2 {
          font-size: 24px;
          color: #1A1A1A;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #F59E0B;
        }

        .section h3 {
          font-size: 18px;
          color: #2563EB;
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .section p {
          margin-bottom: 12px;
        }

        .content {
          color: #4B5563;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #9CA3AF;
        }

        .footer a {
          color: #2563EB;
        }

        .preferences {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .preference-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .preference-gastro { background: #FEF3C7; color: #92400E; }
        .preference-history { background: #EDE9FE; color: #5B21B6; }
        .preference-kids { background: #D1FAE5; color: #065F46; }
        .preference-events { background: #FCE7F3; color: #9D174D; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${trip.name}</h1>
        <p>${trip.description}</p>
      </div>

      <div class="meta">
        <p><strong>Připraveno pro:</strong> ${email}</p>
        <p><strong>Vygenerováno:</strong> ${new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' })}</p>
        <div class="preferences">
          <strong>Vaše zájmy:</strong>
          ${preferences.gastro ? '<span class="preference-badge preference-gastro">Gastro</span>' : ''}
          ${preferences.history ? '<span class="preference-badge preference-history">Historie</span>' : ''}
          ${preferences.kids ? '<span class="preference-badge preference-kids">Pro děti</span>' : ''}
          ${preferences.includeWeekendEvents ? '<span class="preference-badge preference-events">Akce</span>' : ''}
        </div>
      </div>

      ${sectionsHtml}

      <div class="footer">
        <p>Vytvořeno s ❤️ službou <a href="https://tripradar.cz">TripRadar.cz</a></p>
        <p>Pro navigaci v terénu použijte aplikaci Radar na tripradar.cz/radar</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generuje PDF itinerar pomoci Puppeteer
 */
export async function generateItineraryPdf({
  tripId,
  email,
  preferences,
}: GeneratePdfParams): Promise<Buffer> {
  // Generovani HTML
  const html = generateHtmlTemplate(tripId, email, preferences)

  // Spusteni Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Nastaveni obsahu
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generovani PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      printBackground: true,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
