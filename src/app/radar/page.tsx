/**
 * Radar Page - Navigacni aplikace pro terén
 *
 * Zobrazuje body zajmu podle preferenci uzivatele.
 */

import { RadarClient } from './RadarClient'

export const metadata = {
  title: 'Radar | TripRadar',
  description: 'Navigace k bodům zájmu v terénu',
}

export default function RadarPage() {
  return <RadarClient />
}
