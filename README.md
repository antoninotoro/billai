# BillAI — Estrattore Dati da Bollette Energetiche

Analizza bollette energetiche (LUCE e GAS) con AI Gemini 3 Pro. Estrae KPI unitari, storico consumi per fasce (F1, F2, F3), spesa annua e normalizzazione automatica a 12 mesi.

## Features

- 📸 **Upload immagine bolletta** — Carica foto o screenshot della bolletta
- 🤖 **Analisi AI** — Gemini 3 Pro estrae dati strutturati con JSON Schema
- 📊 **KPI Dashboard** — Materia prima, oneri, spese rete, quota fissa
- 📈 **Storico Consumi** — Grafico 12 mesi con dettaglio per fasce (F1/F2/F3)
- 💾 **Export CSV** — Scarica report con tutti i dati estratti
- ⚡ **Serverless API** — Backend API su Vercel, frontend React separato

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Recharts
- **Backend:** Node.js, Vercel Serverless Functions
- **AI:** Google Gemini 3 Pro (generative AI)
- **Build:** Vite

## Requisiti

- Node.js >= 18
- API Key Google Gemini (gratis su [ai.google.dev](https://ai.google.dev/))

## Setup Locale

1. **Clone il repo:**
   ```bash
   git clone https://github.com/antoninotoro/billai.git
   cd billai
   ```

2. **Installa dipendenze:**
   ```bash
   npm install
   ```

3. **Crea `.env.local` con la tua API key:**
   ```bash
   echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env.local
   ```

4. **Avvia il dev server:**
   ```bash
   npm run dev
   ```

   App disponibile su `http://localhost:5173`

5. **Build per produzione:**
   ```bash
   npm run build
   npm run preview
   ```

## Deploy su Vercel

### 1. Connetti il repo a Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### 2. Imposta la variabile d'ambiente in Vercel

Nel pannello Vercel (Settings → Environment Variables), aggiungi:

```
GEMINI_API_KEY = <your-api-key>
```

Verifica che sia disponibile sia per preview che production.

### 3. Deploy automatico

Ogni push a `main` triggerà un rebuild e deploy automatico.

```bash
git add .
git commit -m "Setup BillAI for Vercel"
git push origin main
```

### 4. Verifica il deploy

- Visita `https://<your-project>.vercel.app`
- Carica una bolletta test
- Se vedi un errore, controlla:
  - ✅ `GEMINI_API_KEY` è impostato in Vercel (non deve essere vuoto)
  - ✅ Build logs in Vercel Console → Deployments
  - ✅ Browser Console (F12) per errori di fetch verso `/api/analyze`

## Struttura Progetto

```
.
├── components/           # Componenti React UI
│   ├── Header.tsx
│   ├── FileUploader.tsx
│   ├── DataCard.tsx
│   └── ConsumptionChart.tsx
├── services/
│   └── geminiService.ts  # Client-side wrapper che chiama /api/analyze
├── api/
│   └── analyze.ts        # Vercel Serverless Function (backend)
├── App.tsx               # Componente root
├── types.ts              # Definizioni TypeScript
├── index.html
├── vite.config.ts
└── package.json
```

## API Endpoint

**POST** `/api/analyze`

**Request:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "fornitore": "ENEL",
  "periodo_fatturazione": "Gen-Feb 2024",
  "is_gas": false,
  "prezzo_materia_prima_unitario": 0.12,
  "quota_fissa_mensile": 8.5,
  "oneri_generali_unitario": 0.05,
  "spese_rete_unitario": 0.08,
  "consumo_annuo_totale": 2400,
  "consumo_annuo_fasce": { "f1": 600, "f2": 800, "f3": 1000 },
  "spesa_totale_annua_stima": 450,
  "storico_consumi": [...]
}
```

## Troubleshooting

### "Blank page" su Vercel
- Controlla i build logs: Vercel Dashboard → Deployments
- Assicurati che `GEMINI_API_KEY` sia impostato

### 502 Bad Gateway su /api/analyze
- Verifica che l'API key sia corretta
- Controlla i logs della Vercel Function

### Console error "Server error: 500"
- Controlla i server logs su Vercel (Monitoring → Function Logs)

## Sviluppo

```bash
# Dev con hot reload
npm run dev

# Build production
npm run build

# Preview build locale
npm run preview

# Type check
npx tsc --noEmit
```

## Licenza

MIT

---

**Autore:** [antoninotoro](https://github.com/antoninotoro)  
**Powered by:** Google Gemini API

