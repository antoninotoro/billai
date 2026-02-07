
import { BillData } from "../types";

// NOTE: `@google/genai` is a server-side SDK and must NOT be imported at
// top-level in a frontend bundle (it can leak API keys or require Node APIs).
// We dynamically import it only when running in a Node/server environment.

const BILL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fornitore: { type: Type.STRING, description: "Nome del fornitore" },
    periodo_fatturazione: { type: Type.STRING, description: "Esempio: Gen-Feb 2024" },
    is_gas: { type: Type.BOOLEAN, description: "True se GAS, False se LUCE" },
    giorni_periodo: { type: Type.NUMBER, description: "Giorni coperti dalla bolletta" },
    prezzo_materia_prima_unitario: { type: Type.NUMBER, description: "€/kWh o €/smc" },
    quota_fissa_mensile: { type: Type.NUMBER, description: "€/mese" },
    quota_potenza_mensile: { type: Type.NUMBER, description: "€/kW/mese" },
    oneri_generali_unitario: { type: Type.NUMBER, description: "Quota variabile oneri (€/kWh o €/smc)" },
    spese_rete_unitario: { type: Type.NUMBER, description: "Quota variabile rete (€/kWh o €/smc)" },
    prezzo_energia_unitario: { type: Type.NUMBER, description: "Somma componenti variabili" },
    potenza_impegnata: { type: Type.NUMBER, description: "kW" },
    consumo_annuo_totale: { type: Type.NUMBER, description: "Consumo annuo 12 mesi" },
    consumo_annuo_fasce: {
      type: Type.OBJECT,
      properties: {
        f1: { type: Type.NUMBER },
        f2: { type: Type.NUMBER },
        f3: { type: Type.NUMBER }
      },
      required: ["f1", "f2", "f3"]
    },
    quota_fissa_annua: { type: Type.NUMBER },
    oneri_generali_annui: { type: Type.NUMBER },
    spese_rete_annui: { type: Type.NUMBER },
    storico_consumi: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mese: { type: Type.STRING, description: "Mese e anno, es: Gen 24" },
          valore: { type: Type.NUMBER, description: "Valore totale consumato nel mese" },
          f1: { type: Type.NUMBER, description: "Consumo in fascia F1 (se disponibile, altrimenti 0)" },
          f2: { type: Type.NUMBER, description: "Consumo in fascia F2 (se disponibile, altrimenti 0)" },
          f3: { type: Type.NUMBER, description: "Consumo in fascia F3 (se disponibile, altrimenti 0)" }
        },
        required: ["mese", "valore"]
      },
      description: "Andamento storico consumi ultimi 12 mesi con dettaglio fasce F1/F2/F3"
    },
    spesa_totale_annua_stima: { type: Type.NUMBER },
    spesa_bolletta_attuale: { type: Type.NUMBER }
  },
  required: ["fornitore", "is_gas", "storico_consumi", "spesa_totale_annua_stima"]
};

export async function analyzeBill(base64Image: string): Promise<BillData> {
  // If running in the browser, call the serverless API route which performs the
  // AI call. This keeps the API key and SDK usage on the server.
  if (typeof window !== "undefined") {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server error: ${res.status} ${text}`);
    }
    return (await res.json()) as BillData;
  }

  // Server-side dynamic import to avoid bundling @google/genai into client builds.
  const { GoogleGenAI, Type } = await import("@google/genai");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  const ai = new GoogleGenAI({ apiKey });

  const model = "gemini-3-pro-preview";
  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = matches ? matches[1] : "image/jpeg";
  const data = matches ? matches[2] : base64Image;

  const prompt = `Analizza questa bolletta energetica italiana. 
  1. Estrai i KPI unitari variabili (€/kWh o €/smc).
  2. Estrai la Quota Fissa mensile.
  3. IDENTIFICA lo STORICO CONSUMI: cerca il grafico o la tabella dei consumi mensili dell'ultimo anno. 
  4. Per ogni mese dello storico, estrai se possibile il dettaglio per FASCE (F1, F2, F3). Se vedi solo il totale, metti F1/F2/F3 a 0.
  5. Normalizza tutti i dati su base annua (12 mesi).
  6. Calcola la spesa annua totale stimata.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data } }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: BILL_ANALYSIS_SCHEMA,
      temperature: 0.1,
    }
  });

  if (!response.text) throw new Error("Lettura fallita.");
  return JSON.parse(response.text) as BillData;
}
