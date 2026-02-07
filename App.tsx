
import React, { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import DataCard from './components/DataCard';
import ConsumptionChart from './components/ConsumptionChart';
import { analyzeBill } from './services/geminiService';
import { ProcessingState, BillData } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    result: null,
  });

  const handleFileSelect = async (base64: string) => {
    setState({ isProcessing: true, error: null, result: null });
    try {
      const data = await analyzeBill(base64);
      setState({ isProcessing: false, result: data, error: null });
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setState({ 
        isProcessing: false, 
        result: null, 
        error: "Errore durante l'analisi. Verifica che lo storico consumi e il dettaglio fasce siano leggibili." 
      });
    }
  };

  const exportCSV = () => {
    if (!state.result) return;
    const r = state.result;
    
    const rows = [
      ["Categoria", "Parametro", "Valore", "Unita"],
      ["Generale", "Fornitore", r.fornitore, ""],
      ["Generale", "Periodo", r.periodo_fatturazione, ""],
      ["KPI Unitario", "Materia Prima", r.prezzo_materia_prima_unitario, "€/unità"],
      ["KPI Unitario", "Oneri Generali", r.oneri_generali_unitario, "€/unità"],
      ["KPI Unitario", "Spese Rete", r.spese_rete_unitario, "€/unità"],
      ["KPI Unitario", "Quota Fissa", r.quota_fissa_mensile, "€/mese"],
      ["Annuale", "Consumo Totale", r.consumo_annuo_totale, r.is_gas ? "smc" : "kWh"],
      ["Annuale", "Spesa Stimata", r.spesa_totale_annua_stima, "€"],
      [],
      ["Storico Mese", "Consumo Totale", "F1", "F2", "F3"],
      ...r.storico_consumi.map(item => [
        item.mese, 
        item.valore, 
        item.f1 || 0, 
        item.f2 || 0, 
        item.f3 || 0
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Analisi_Dettagliata_${r.fornitore.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setState({ isProcessing: false, result: null, error: null });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">BillAI Analytics Engine</h1>
          <p className="mt-4 text-lg text-slate-600">Dall'immagine ai KPI: normalizzazione, storico e scomposizione tariffe.</p>
        </div>

        {!state.result && !state.isProcessing && (
          <div className="bg-white rounded-3xl shadow-2xl p-4 max-w-2xl mx-auto border border-slate-100">
            <FileUploader onFileSelect={handleFileSelect} disabled={state.isProcessing} />
          </div>
        )}

        {state.isProcessing && (
          <div className="bg-white rounded-3xl shadow-xl p-12 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto border border-slate-100">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-slate-900">Analisi Storica Multidimensionale...</h2>
          </div>
        )}

        {state.result && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Context & Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
                   <i className={`fas ${state.result.is_gas ? 'fa-fire' : 'fa-bolt'} text-2xl`}></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{state.result.fornitore}</h2>
                  <p className="text-slate-500 font-medium">{state.result.periodo_fatturazione}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={exportCSV} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                  <i className="fas fa-file-csv mr-2"></i> Esporta Report CSV
                </button>
                <button onClick={reset} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  Nuova Analisi
                </button>
              </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DataCard label="Materia Prima" value={state.result.prezzo_materia_prima_unitario.toFixed(4)} unit={state.result.is_gas ? "€/smc" : "€/kWh"} icon="fas fa-tag" colorClass="bg-blue-500" />
              <DataCard label="Oneri Generali" value={state.result.oneri_generali_unitario.toFixed(4)} unit={state.result.is_gas ? "€/smc" : "€/kWh"} icon="fas fa-landmark" colorClass="bg-purple-500" />
              <DataCard label="Spese Rete" value={state.result.spese_rete_unitario.toFixed(4)} unit={state.result.is_gas ? "€/smc" : "€/kWh"} icon="fas fa-network-wired" colorClass="bg-cyan-500" />
              <DataCard label="Quota Fissa" value={state.result.quota_fissa_mensile.toFixed(2)} unit="€/mese" icon="fas fa-lock" colorClass="bg-slate-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Historical Section */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <i className="fas fa-chart-line mr-2 text-blue-600"></i> Andamento Storico Consumi Totali
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={state.result.storico_consumi}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="mese" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="valore" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Table for History with Fasce detail */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Dettaglio Storico per Fasce</h3>
                    <div className="flex space-x-2">
                       <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded">F1: Picco</span>
                       <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded">F2: Interm.</span>
                       <span className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-600 rounded">F3: Fuori P.</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mese</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Totale ({state.result.is_gas ? 'smc' : 'kWh'})</th>
                          <th className="pb-4 text-[10px] font-black text-blue-500 uppercase tracking-widest">F1</th>
                          <th className="pb-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest">F2</th>
                          <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">F3</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {state.result.storico_consumi.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 text-sm font-semibold text-slate-700">{item.mese}</td>
                            <td className="py-4 text-sm font-bold text-slate-900">{item.valore}</td>
                            <td className="py-4 text-sm text-blue-600 font-medium">{item.f1 || '-'}</td>
                            <td className="py-4 text-sm text-indigo-600 font-medium">{item.f2 || '-'}</td>
                            <td className="py-4 text-sm text-slate-500 font-medium">{item.f3 || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-[10px] text-slate-400 italic">
                    Nota: Se il dettaglio F1/F2/F3 non è presente nel grafico storico della bolletta, i campi potrebbero risultare vuoti.
                  </p>
                </div>
              </div>

              {/* Annual Summary Sidebar */}
              <aside className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl border border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Annuo Proiettato</p>
                  <p className="text-5xl font-black">{state.result.spesa_totale_annua_stima.toFixed(0)} €</p>
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Consumo Annuo</span>
                      <span className="font-bold">{state.result.consumo_annuo_totale} {state.result.is_gas ? 'smc' : 'kWh'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Quota Fissa Annua</span>
                      <span className="font-bold">{state.result.quota_fissa_annua.toFixed(2)} €</span>
                    </div>
                  </div>
                  <hr className="my-6 border-slate-800" />
                  <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all">
                    Analisi Risparmio
                  </button>
                </div>
                
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                   <ConsumptionChart data={state.result.consumo_annuo_fasce} />
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">BillAI Intelligence Engine</p>
          <p className="text-slate-400 text-xs mt-4">Analisi tecnica basata su modelli Gemini 3 Pro con estrazione multidimensionale dei consumi.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
