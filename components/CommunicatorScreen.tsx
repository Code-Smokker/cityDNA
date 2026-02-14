
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { CityData, AppState } from '../types';
import { Mic, MicOff, Globe, Sparkles, Target, Languages, ArrowRightLeft, Volume2, RefreshCw, Camera, Image as ImageIcon, ScanLine, X } from 'lucide-react';

interface CommunicatorScreenProps {
  cityData: CityData;
  context?: AppState['communicatorContext'];
}

// Audio Utils (Reused)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Kannada', code: 'kn' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Telugu', code: 'te' },
  { name: 'Marathi', code: 'mr' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Gujarati', code: 'gu' }
];

const CommunicatorScreen: React.FC<CommunicatorScreenProps> = ({ cityData, context }) => {
  const [mode, setMode] = useState<'VOICE' | 'LENS'>('VOICE');

  // Voice State
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'negotiating'>('idle');
  const [userLang, setUserLang] = useState('English');
  const [merchantLang, setMerchantLang] = useState(cityData.active_language || 'Hindi');

  // Lens State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lensAnalysis, setLensAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // --- Voice Logic (Same as before) ---
  useEffect(() => {
    if (isActive) {
      stopSession();
      startSession();
    }
  }, [userLang, merchantLang]);

  const startSession = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const callbacks = {
        onopen: () => {
          setStatus('listening');
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e: any) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;

            sessionPromise.then((session) => {
              session.sendRealtimeInput({
                media: {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000'
                }
              });
            });
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            setTranscription(prev => [...prev.slice(-10), { role: 'agent', text }]);
          }
          const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio && audioContextRef.current) {
            setStatus('speaking');
            const nextStartTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const buffer = await decodeAudioData(decode(audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(nextStartTime);
            nextStartTimeRef.current = nextStartTime + buffer.duration;
            source.onended = () => {
              if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current) {
                setStatus('listening');
              }
            };
          }
        },
        onerror: (e: any) => {
          console.error("Live session error:", e);
          stopSession();
        },
        onclose: () => stopSession()
      };

      const systemInstruction = `You are the "LokalOS Urban Bridge" in ${cityData.city}.
      ROLE: Real-time Bilingual Translator and Negotiation Proxy.
      USER PREFERRED LANGUAGE: ${userLang}.
      MERCHANT PREFERRED LANGUAGE: ${merchantLang}.
      
      BEHAVIOR:
      1. You are a bridge. When the user speaks in ${userLang}, translate it into ${merchantLang} with a street-smart, respectful negotiation tone.
      2. When the merchant speaks in ${merchantLang}, translate it back to the user in ${userLang}.
      3. Use your knowledge of ${cityData.city} markets and fairness. 
      ${context ? `Target Item: ${context.itemName}. Target Price: ₹${context.targetPrice}. Current Quote: ₹${context.currentPrice}.` : ''}
      4. Always optimize for a fair deal using Mandi rates as your logical anchor.
      5. Output audio ONLY in the target language (if user speaks, AI speaks ${merchantLang}; if merchant speaks, AI speaks ${userLang}).`;

      const sessionPromise = gemini.connectLive(callbacks, systemInstruction);
      sessionRef.current = await sessionPromise;
      setIsActive(true);
    } catch (err) {
      console.error("Failed to start session:", err);
      setIsActive(false);
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  const toggleLanguages = () => {
    setUserLang(merchantLang);
    setMerchantLang(userLang);
  };

  // --- Lens Logic ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImage(base64String);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setLensAnalysis(null);
    try {
      const base64Content = base64Data.split(',')[1];
      const result = await gemini.analyzeImage(base64Content, `Identify what is in this image. Translate any text to ${userLang}. Explain its cultural or practical significance in ${cityData.city}. If it's food, mention ingredients. If it's a menu, recommend the best item.`);
      setLensAnalysis(result);
    } catch (error) {
      setLensAnalysis("Lens calibration failed. Unable to decode visual data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearLens = () => {
    setCapturedImage(null);
    setLensAnalysis(null);
  };

  return (
    <div className="py-8 space-y-8 animate-in fade-in duration-1000 max-w-4xl mx-auto">
      <header className="px-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <img src="/logo.png" alt="Logo" className="w-35 h-35 object-contain animate-in zoom-in duration-500" />
          <a href="">CityDNA</a>
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 italic uppercase leading-none drop-shadow-sm">Communicator</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] ml-2">Neural Bridge & Visual Lens</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 rounded-full p-1 self-start md:self-end">
          <button
            onClick={() => setMode('VOICE')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${mode === 'VOICE' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
          >
            Voice Bridge
          </button>
          <button
            onClick={() => setMode('LENS')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${mode === 'LENS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
          >
            Visual Lens
          </button>
        </div>
      </header>

      {mode === 'VOICE' ? (
        <>
          {/* Real-time Language Bridge Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/80 backdrop-blur-xl material-shadow rounded-[36px] p-2 border border-white mx-4">
            <div className="flex-1 flex items-center gap-2 px-5 py-3 bg-blue-50 rounded-[24px] border border-blue-100 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">You Speak</span>
                <select
                  value={userLang}
                  onChange={(e) => setUserLang(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-tight outline-none cursor-pointer text-blue-900"
                >
                  {LANGUAGES.map(l => <option key={l.code}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={toggleLanguages}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-90 text-slate-400 hover:text-slate-900"
              title="Swap Languages"
            >
              <ArrowRightLeft size={18} />
            </button>

            <div className="flex-1 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-[24px] w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">They Speak</span>
                <select
                  value={merchantLang}
                  onChange={(e) => setMerchantLang(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-tight outline-none cursor-pointer text-white"
                >
                  {LANGUAGES.map(l => <option key={l.code}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Voice Interaction Visualization */}
          <div className="px-4 flex flex-col items-center">
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-[60px] border-slate-900/5 transition-all duration-[3000ms] ease-out ${isActive ? 'scale-125 opacity-10 rotate-90' : 'scale-90 opacity-0'}`} />
              <div className={`absolute inset-0 rounded-[100px] border border-blue-500/10 transition-all duration-[2000ms] ${isActive ? 'scale-110 opacity-100 rotate-[-15deg]' : 'scale-50 opacity-0'}`} />

              <div className="relative z-20 bg-slate-900 rounded-[80px] w-full h-full flex flex-col items-center justify-center shadow-[0_40px_100px_-20px_rgba(15,23,42,0.5)] p-8 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

                <button
                  onClick={isActive ? stopSession : startSession}
                  className={`group relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl active:scale-95 z-30 ${isActive ? 'bg-red-500 ring-[12px] ring-red-500/10' : 'bg-white hover:brightness-110'
                    }`}
                >
                  {isActive ? (
                    <MicOff size={72} className="text-white animate-pulse" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Mic size={72} className="text-slate-900" />
                      <span className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.3em] group-hover:text-slate-900 transition-colors">Start Bridge</span>
                    </div>
                  )}
                  {isActive && <div className="absolute -inset-4 border-2 border-dashed border-white/20 rounded-full animate-spin-slow" />}
                </button>

                <div className="absolute bottom-16 text-center z-30 space-y-5 w-full px-12">
                  <div className="flex justify-center items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${status === 'speaking' ? 'bg-blue-400' : 'bg-slate-700'} animate-pulse`} />
                    <p className="text-white font-black text-2xl uppercase tracking-tighter transition-all duration-500">
                      {status === 'idle' && "Standby"}
                      {status === 'listening' && "Listening..."}
                      {status === 'speaking' && "Agent Relay..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Log */}
          <div className="mx-4 bg-white/80 backdrop-blur-xl rounded-[48px] p-8 material-shadow border border-white space-y-6">
            {/* ... (Same as before, keep logic) ... */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide px-2">
              {transcription.length === 0 && (
                <div className="flex flex-col items-center py-12 opacity-10">
                  <Globe size={64} className="text-slate-900 mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 italic">No Active Packets</p>
                </div>
              )}
              {transcription.map((entry, i) => (
                <div key={i} className={`flex flex-col animate-in slide-in-from-bottom-2 duration-500 ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-[32px] px-7 py-4 text-sm font-bold leading-relaxed shadow-sm ${entry.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mx-4 flex flex-col gap-6">
          {/* LENS MODE */}
          <div className="bg-slate-900 rounded-[48px] aspect-[4/3] relative overflow-hidden flex flex-col items-center justify-center p-8 text-center border-4 border-slate-900 material-shadow">
            {capturedImage ? (
              <>
                <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {isAnalyzing ? (
                  <div className="z-10 flex flex-col items-center gap-4">
                    <ScannerEffect />
                    <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Analyzing Visual Data...</p>
                  </div>
                ) : (
                  <div className="z-10 absolute bottom-0 left-0 w-full p-8 text-left">
                    <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-4">Analysis Complete</div>
                    <div className="text-white text-lg font-bold leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                      {lensAnalysis}
                    </div>
                  </div>
                )}

                <button
                  onClick={clearLens}
                  className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 z-10">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-700">
                  <ScanLine size={40} className="text-slate-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase tracking-wider text-xl">LokalOS Lens</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-[200px] mx-auto">Scan menus, signs, or objects for instant translation & context.</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-900/50 active:scale-95"
                  >
                    <ImageIcon size={16} /> Upload Image
                  </button>
                  {/* Camera capture logic would go here in a real PWA */}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

const ScannerEffect = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] absolute top-0 animate-scan" />
  </div>
);

export default CommunicatorScreen;
