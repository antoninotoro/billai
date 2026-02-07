import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// This schema matches the BillData interface expected by the frontend.
const BILL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fornitore: { type: Type.STRING },
    periodo_fatturazione: { type: Type.STRING },
    is_gas: { type: Type.BOOLEAN },
    giorni_periodo: { type: Type.NUMBER },
    prezzo_materia_prima_unitario: { type: Type.NUMBER },
    quota_fissa_mensile: { type: Type.NUMBER },
    quota_potenza_mensile: { type: Type.NUMBER },
    oneri_generali_unitario: { type: Type.NUMBER },
    spese_rete_unitario: { type: Type.NUMBER },
    prezzo_energia_unitario: { type: Type.NUMBER },
    potenza_impegnata: { type: Type.NUMBER },
    consumo_annuo_totale: { type: Type.NUMBER },
    consumo_annuo_fasce: {
      type: Type.OBJECT,
      properties: {
        f1: { type: Type.NUMBER },
        f2: { type: Type.NUMBER },
        f3: { type: Type.NUMBER }
      },
      required: ['f1', 'f2', 'f3']
    },
    quota_fissa_annua: { type: Type.NUMBER },
    oneri_generali_annui: { type: Type.NUMBER },
    spese_rete_annui: { type: Type.NUMBER },
    storico_consumi: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mese: { type: Type.STRING },
          valore: { type: Type.NUMBER },
          f1: { type: Type.NUMBER },
          f2: { type: Type.NUMBER },
          f3: { type: Type.NUMBER }
        },
        required: ['mese', 'valore']
      }
    },
    spesa_totale_annua_stima: { type: Type.NUMBER },
    spesa_bolletta_attuale: { type: Type.NUMBER }
  },
  required: ['fornitore', 'is_gas', 'storico_consumi', 'spesa_totale_annua_stima']
};

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
const ai = new GoogleGenAI({ apiKey });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[analyze] request method:', req.method);
  console.log('[analyze] body size:', JSON.stringify(req.body).length, 'bytes');
  
  try {
    if (req.method !== 'POST') {
      console.warn('[analyze] invalid method:', req.method);
      res.status(405).send('Method Not Allowed');
      return;
    }
    const { image } = req.body || {};
    if (!image) {
      console.warn('[analyze] missing image in body');
      return res.status(400).send('Missing image in request body');
    }

    console.log('[analyze] image size:', image.length, 'bytes');
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const data = matches ? matches[2] : image;
    
    console.log('[analyze] mime type:', mimeType);
    console.log('[analyze] calling Gemini API...');

    const prompt = `Analizza questa bolletta energetica italiana.
1. Estrai i KPI unitari variabili (€/kWh o €/smc).
2. Estrai la Quota Fissa mensile.
3. IDENTIFICA lo STORICO CONSUMI: cerca il grafico o la tabella dei consumi mensili dell'ultimo anno.
4. Per ogni mese dello storico, estrai se possibile il dettaglio per FASCE (F1, F2, F3). Se vedi solo il totale, metti F1/F2/F3 a 0.
5. Normalizza tutti i dati su base annua (12 mesi).
6. Calcola la spesa annua totale stimata.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data } }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: BILL_ANALYSIS_SCHEMA,
        temperature: 0.1,
      }
    });

    console.log('[analyze] Gemini response received');
    if (!response.text) {
      console.error('[analyze] empty response from Gemini');
      return res.status(502).send('AI response empty');
    }

    const parsed = JSON.parse(response.text);
    console.log('[analyze] response parsed successfully');
    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('[analyze] error:', err?.message || String(err), err);
    res.status(500).send(err?.message || 'Internal Server Error');
  }
}
