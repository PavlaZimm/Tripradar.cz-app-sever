/**
 * Resend Service - Odesilani transakcnich emailu
 *
 * Odesila personalizovane itinerare zakaznikum po zaplaceni.
 */

import { Resend } from 'resend'

// Inicializace Resend klienta
const resend = new Resend(process.env.RESEND_API_KEY)

// Nazvy vyletu pro email subject
const TRIP_NAMES: Record<string, string> = {
  'borena-tajemstvi': 'Tajemství Bořeně',
}

interface SendItineraryEmailParams {
  to: string
  tripId: string
  pdfBuffer: Buffer
}

/**
 * Odesle email s PDF itinerarem
 */
export async function sendItineraryEmail({
  to,
  tripId,
  pdfBuffer,
}: SendItineraryEmailParams): Promise<void> {
  const tripName = TRIP_NAMES[tripId] || 'Váš výlet'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tripradar.cz'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripradar.cz'

  await resend.emails.send({
    from: `TripRadar <${fromEmail}>`,
    to: [to],
    subject: `Váš itinerář: ${tripName}`,
    html: generateEmailHtml(tripName, appUrl),
    attachments: [
      {
        filename: `tripradar-${tripId}.pdf`,
        content: pdfBuffer,
      },
    ],
  })
}

/**
 * Generuje HTML obsah emailu
 */
function generateEmailHtml(tripName: string, appUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="
      font-family: 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #1A1A1A;
      background: #F5F5F5;
      margin: 0;
      padding: 20px;
    ">
      <div style="
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          padding: 40px 32px;
          text-align: center;
        ">
          <h1 style="
            color: white;
            font-size: 28px;
            margin: 0 0 8px 0;
          ">Váš výlet je připraven!</h1>
          <p style="
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin: 0;
          ">${tripName}</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="margin: 0 0 24px 0; font-size: 16px;">
            Děkujeme za vaši objednávku! V příloze najdete váš personalizovaný
            itinerář ve formátu PDF.
          </p>

          <div style="
            background: #F3F4F6;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          ">
            <h2 style="
              font-size: 18px;
              margin: 0 0 12px 0;
              color: #1A1A1A;
            ">Co dál?</h2>
            <ol style="
              margin: 0;
              padding-left: 20px;
              color: #4B5563;
            ">
              <li style="margin-bottom: 8px;">
                Stáhněte si PDF itinerář z přílohy
              </li>
              <li style="margin-bottom: 8px;">
                Otevřete aplikaci Radar pro navigaci v terénu
              </li>
              <li style="margin-bottom: 8px;">
                Užijte si svůj personalizovaný výlet!
              </li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${appUrl}/radar" style="
              display: inline-block;
              background: #2563EB;
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
            ">Otevřít Radar</a>
          </div>

          <p style="
            margin: 0;
            font-size: 14px;
            color: #6B7280;
            text-align: center;
          ">
            Tip: Přidejte si aplikaci na plochu telefonu pro rychlý přístup!
          </p>
        </div>

        <!-- Footer -->
        <div style="
          background: #F9FAFB;
          padding: 24px 32px;
          text-align: center;
          border-top: 1px solid #E5E7EB;
        ">
          <p style="
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #6B7280;
          ">
            Máte dotazy? Napište nám na
            <a href="mailto:info@tripradar.cz" style="color: #2563EB;">info@tripradar.cz</a>
          </p>
          <p style="
            margin: 0;
            font-size: 12px;
            color: #9CA3AF;
          ">
            © 2026 TripRadar.cz | Bílina, Česká republika
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Odesle uvitaci email po registraci (pro budouci pouziti)
 */
export async function sendWelcomeEmail(to: string, name?: string): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tripradar.cz'

  await resend.emails.send({
    from: `TripRadar <${fromEmail}>`,
    to: [to],
    subject: 'Vítejte v TripRadar!',
    html: `
      <div style="font-family: system-ui, sans-serif; padding: 20px;">
        <h1>Ahoj${name ? ` ${name}` : ''}!</h1>
        <p>Vítejte v TripRadar - vašem průvodci výlety na Bílinsku.</p>
        <p>Těšíme se na vaše dobrodružství!</p>
      </div>
    `,
  })
}
