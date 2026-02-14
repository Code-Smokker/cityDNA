
import React, { useState, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { CityData, ComparisonItem, AppState } from '../types';
import { Search, ShoppingBasket, Truck, ShieldCheck, Store, AlertCircle, Mic, ArrowRight, Camera, X, Wand2, RefreshCw } from 'lucide-react';

interface BharatCompareProps {
  cityData: CityData;
  onStartNegotiation: (context: AppState['negotiationContext']) => void;
}

const BharatCompare: React.FC<BharatCompareProps> = ({ cityData, onStartNegotiation }) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const activeQuery = customQuery || query;
    if (!activeQuery) return;
    setLoading(true);
    try {
      const results = await gemini.getPriceComparison(activeQuery, cityData.city);
      setItems(results);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await gemini.analyzeImage(base64, "Identify this grocery or market item. Tell me its common name and estimated market quality.");
        setScanResult(analysis);
        // Extract a probable item name for search
        const itemNameMatch = analysis.match(/Item Name:\s*([^\n]+)/i) || analysis.match(/^([^.,\n]+)/);
        if (itemNameMatch) setQuery(itemNameMatch[1].trim());
      } catch (err) {
        console.error(err);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const text = await gemini.transcribeAudio(base64);
          if (text) {
            setQuery(text);
            handleSearch(undefined, text);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="py-8 space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2 px-2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">Bharat-Compare</h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">ONDC Trust Layer • Mandi Pricing Protocol</p>
      </header>

      <div className="space-y-6">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto md:mx-0 relative group">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl group-focus-within:opacity-100 opacity-0 transition-opacity duration-700"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Verify Mandi price for any item..."
            className="relative w-full bg-white rounded-[40px] px-10 py-7 pr-44 material-shadow border border-slate-100 focus:outline-none focus:ring-8 focus:ring-blue-100/50 transition-all font-bold text-xl md:text-2xl placeholder:text-slate-200"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-all"
            >
              <Camera size={20} />
            </button>
            <button 
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <Mic size={20} />
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all hover:brightness-110"
              style={{ backgroundColor: cityData.accent_color }}
            >
              {loading ? <div className="w-8 h-8 border-4 border-white border-t-transparent animate-spin rounded-full" /> : <Search size={28} />}
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" capture="environment" />
        </form>

        {/* Scan Result Overlay */}
        {(scanning || scanResult) && (
          <div className="bg-slate-900 rounded-[40px] p-8 text-white material-shadow animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
             <div className="relative z-10 flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-500 rounded-2xl">
                      {scanning ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Visual Neural Scanner</h4>
                      <p className="text-sm font-bold text-white/90 leading-relaxed italic max-w-2xl">
                        {scanning ? "Parsing visual packet data..." : scanResult}
                      </p>
                   </div>
                </div>
                <button onClick={() => setScanResult(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={16} /></button>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {items.length === 0 && !loading && (
          <div className="col-span-full py-32 flex flex-col items-center opacity-10 text-center space-y-6">
            <ShoppingBasket size={120} strokeWidth={1} className="text-slate-900" />
            <p className="font-black uppercase tracking-[0.5em] text-xs">Awaiting ONDC Node Sync</p>
          </div>
        )}

        {items.map((item) => {
          const savings = item.ecommerce_price - item.mandi_price;
          const needsNegotiation = item.ecommerce_price > item.mandi_price * 1.05;

          return (
            <div key={item.id} className="bg-white rounded-[56px] p-8 md:p-10 material-shadow border border-slate-50 flex flex-col space-y-8 animate-in slide-in-from-bottom-8 duration-700 hover:border-blue-100 transition-all group">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{item.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      Fairness: {item.social_value_score}%
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      {item.local_trust}% Local Trust
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl opacity-50">
                   <ShieldCheck size={24} className="text-slate-400" />
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[36px] border border-blue-100/50 relative">
                <AlertCircle className="absolute -top-3 -left-3 text-blue-600 bg-white rounded-full p-1 shadow-md" size={28} />
                <p className="text-sm md:text-base font-bold text-blue-900 leading-relaxed italic opacity-90">
                  "{item.fairness_reasoning}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col justify-center transition-all group-hover:bg-white">
                  <div className="flex items-center gap-2 mb-2 opacity-30">
                    <Store size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Mandi Index</span>
                  </div>
                  <p className="text-4xl md:text-5xl font-black text-slate-900">₹{item.mandi_price}</p>
                </div>
                <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col justify-center transition-all group-hover:bg-white">
                  <div className="flex items-center gap-2 mb-2 opacity-30">
                    <ShoppingBasket size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Retail Ask</span>
                  </div>
                  <p className="text-4xl md:text-5xl font-black text-slate-900">₹{item.ecommerce_price}</p>
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  className="flex-1 py-6 rounded-[32px] text-white font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:brightness-110"
                  style={{ backgroundColor: cityData.accent_color }}
                >
                  Buy via ONDC <Truck size={20} />
                </button>
                
                {needsNegotiation && (
                  <button 
                    onClick={() => onStartNegotiation({
                      itemName: item.name,
                      targetPrice: item.mandi_price,
                      currentPrice: item.ecommerce_price,
                      reasoning: item.fairness_reasoning
                    })}
                    className="flex-1 py-6 rounded-[32px] bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-slate-800"
                  >
                    Negotiate <Mic size={20} className="text-yellow-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BharatCompare;
