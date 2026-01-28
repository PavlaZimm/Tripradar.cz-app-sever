# TripRadar Sever - Claude Code Dokumentace

> Tento soubor slouzi jako hlavni reference pro AI asistenty a vyvojare pracujici na projektu.

## Prehled projektu

**TripRadar Sever** je personalizovany a hravy ekosystem pro vyletove zazitky na Bilinsku. Platforma kombinuje PWA s dynamicky generovanym informacnim servisem.

### Klicove domeny
- `tripradar.cz` - hlavni aplikace
- `bilinsko.cz` - marketingovy trychtyˇr (microsite)

---

## Tech Stack

| Technologie | Verze | Ucˇel |
|------------|-------|-------|
| Next.js | 16.x | Framework, App Router |
| React | 19.x | UI knihovna |
| TypeScript | 5.7+ | Typova bezpecˇnost |
| Supabase | 2.x | Databaze, Auth |
| Stripe | 17.x | Platby |
| Resend | 4.x | Transakcˇnı´ emaily |
| Puppeteer | 24.x | PDF generova´nı´ |
| Serwist | 9.x | PWA Service Worker |
| Tailwind CSS | 3.4+ | Styly |
| Lottie | 2.x | Animace |

---

## Architektura slozˇek

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout s PWA meta
│   ├── page.tsx           # Homepage
│   ├── sw.ts              # Service Worker (Serwist)
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout
│   │   ├── webhook/       # Stripe webhooks
│   │   └── pdf/           # PDF generova´nı´
│   ├── radar/             # Radarova´ navigace
│   └── configure/         # Konfigurace vy´letu
│
├── components/
│   ├── ui/                # Za´kladnı´ UI komponenty
│   ├── radar/             # Radar komponenta
│   └── scratch-card/      # Stı´racı´ karta
│
├── services/
│   ├── pdf/               # Puppeteer PDF sˇablony
│   ├── stripe/            # Stripe integrace
│   └── resend/            # Email sˇablony
│
├── lib/
│   ├── supabase/          # Supabase klienti
│   └── utils/             # Pomocne´ funkce
│
├── hooks/                 # React hooks (useGeolocation, useVibration)
├── types/                 # TypeScript definice
└── styles/                # Globa´lnı´ styly
```

---

## Design System: Sunlight-Ready Interface

### Barevna´ paleta

```css
/* Zakladni barvy - NE cista bila/cerna */
--color-background: #F5F5F5;  /* Off-white */
--color-foreground: #1A1A1A;  /* Hluboka seda */

/* Kategorie RadarPoints */
--color-food: #F59E0B;     /* Gastro */
--color-history: #8B5CF6;  /* Historie */
--color-event: #EC4899;    /* Akce */
--color-kids: #10B981;     /* Deti */
--color-nature: #059669;   /* Priroda */
```

### Kontrastnı´ pomˇery
- Text: min. **4.5:1**
- Graficke´ prvky: min. **3:1**

### Palcova´ zo´na
Vsˇechny interaktivnı´ prvky umı´stit do **spodnı´ trˇetiny obrazovky** (33vh).

---

## Databazove schema (Supabase)

### Tabulka: `trips`
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  route_json JSONB NOT NULL,
  metadata_schema JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabulka: `radar_points`
```sql
CREATE TABLE radar_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('food', 'history', 'event', 'kids', 'nature')),
  coords JSONB NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabulka: `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  user_email TEXT NOT NULL,
  preferences JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled')),
  stripe_payment_intent_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Struktura `preferences` (JSONB)
```json
{
  "gastro": true,
  "history": true,
  "kids": false,
  "include_weekend_events": true
}
```

---

## Workflow pro testova´nı´ geofencingu

### 1. Loka´lnı´ testova´nı´
```bash
# Pouzij Chrome DevTools -> Sensors -> Override location
# Koordinaty pro Boren: 50.5456° N, 13.7811° E
```

### 2. Mock data
V development modu pouzivej hook `useGeolocationMock`:
```typescript
const { position, simulateMovement } = useGeolocationMock({
  startPoint: { lat: 50.545, lng: 13.781 },
  endPoint: { lat: 50.548, lng: 13.785 },
  duration: 10000 // ms
})
```

### 3. Vibracˇnı´ feedback
- Vzda´lenost > 100m: zˇa´dna´ vibrace
- Vzda´lenost 50-100m: 1 pulz za 2s
- Vzda´lenost < 50m: 2 pulzy za 1s
- Dosazˇenı´ cı´le: dlouhy´ pulz + Lottie animace

---

## Pru˚beˇh vy´voje (Audit Trail)

### Prompt 1: Setup ✅
- [x] Next.js 16 PWA struktura
- [x] CLAUDE.md dokumentace
- [x] Typove definice
- [ ] Supabase tabulka 'Orders'

### Prompt 2: UI/UX ✅
- [x] Sunlight-Ready design implementace (Button, Card, Input, Toggle)
- [x] Digital Scratch Card komponenta
- [x] Lottie animace (Celebration komponenta)

### Prompt 3: Personalizace ✅
- [x] Multi-step formula´rˇ (/configure)
- [x] Stripe Checkout integrace (API + service)
- [x] Success/Cancel stra´nky

### Prompt 4: Fulfillment (cˇeka´)
- [ ] Stripe webhook
- [ ] Puppeteer PDF generova´nı´
- [ ] Resend integrace

### Prompt 5: Radar (cˇeka´)
- [ ] Geolocation API
- [ ] Vibracˇnı´ feedback
- [ ] Filtrace podle preferences

---

## Du˚lezˇite´ prˇı´kazy

```bash
# Instalace
npm install

# Vy´voj
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Konvence ko´du

### Pojmenova´nı´
- Komponenty: PascalCase (`RadarPoint.tsx`)
- Hooks: camelCase s prefixem `use` (`useGeolocation.ts`)
- Utility: camelCase (`formatDistance.ts`)
- Typy: PascalCase (`UserPreferences`)

### Komentarˇe
- Kazˇdy´ soubor zacˇı´na´ docstringem s u´cˇelem
- Komplexnı´ logika vyzˇaduje inline komentarˇe

### Git commits
```
feat: popis nove funkce
fix: popis opravy
refactor: popis refaktoru
docs: popis dokumentace
```

---

## Bezpecˇnost

- **NIKDY** necommituj `.env` soubory
- Stripe webhook signature vzˇdy validuj
- Supabase RLS (Row Level Security) pro vsˇechny tabulky
- Sanitizuj user input prˇed PDF generova´nı´m

---

## Kontakty a zdroje

- Repo: github.com/PavlaZimm/Tripradar.cz-app-sever
- Supabase dashboard: app.supabase.com
- Stripe dashboard: dashboard.stripe.com
- Resend dashboard: resend.com

---

*Posledni aktualizace: 2026-01-28*
