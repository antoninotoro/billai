
export interface ConsumptionByBand {
  f1: number;
  f2: number;
  f3: number;
}

export interface HistoryItem {
  mese: string;
  valore: number; // Total consumption for the month (kWh)
  f1?: number;    // Consumption in F1
  f2?: number;    // Consumption in F2
  f3?: number;    // Consumption in F3
}

export interface BillData {
  fornitore: string;
  periodo_fatturazione: string;
  is_gas: boolean;
  
  // Normalized Annual KPIs
  prezzo_energia_unitario: number; // Total Variable (€/kWh or €/smc)
  potenza_impegnata: number; // kW
  
  consumo_annuo_totale: number; // Normalized to 12 months
  consumo_annuo_fasce: ConsumptionByBand;
  
  // Unit Rates (KPI Unitari)
  prezzo_materia_prima_unitario: number; // €/unit
  quota_fissa_mensile: number; // €/mese
  quota_potenza_mensile: number; // €/kW/mese
  oneri_generali_unitario: number; // €/unit
  spese_rete_unitario: number; // €/unit
  
  // Normalized Annual Costs
  quota_fissa_annua: number;
  oneri_generali_annui: number;
  spese_rete_annui: number;
  
  // Historical Data
  storico_consumi: HistoryItem[];
  
  spesa_totale_annua_stima: number;
  spesa_bolletta_attuale: number;
  giorni_periodo: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  result: BillData | null;
}
