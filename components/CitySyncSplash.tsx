
import React, { useEffect, useState, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { CityData } from '../types';
import { MapPin, Loader2, RefreshCw, ChevronRight } from 'lucide-react';

interface CitySyncSplashProps {
  onComplete: (data: CityData) => void;
}

const CitySyncSplash: React.FC<CitySyncSplashProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'locating' | 'syncing' | 'generating' | 'error'>('locating');
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [showBypass, setShowBypass] = useState(false);
  const bypassTimerRef = useRef<number | null>(null);

  const init = async () => {
    setStatus('locating');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Location timeout")), 10000);
        navigator.geolocation.getCurrentPosition(
          (p) => { clearTimeout(timeout); resolve(p); },
          (e) => { clearTimeout(timeout); reject(e); },
          { timeout: 8000 }
        );
      });

      setStatus('syncing');
      const data = await gemini.getCityMetadata(pos.coords.latitude, pos.coords.longitude);
      setCityData(data);

      setStatus('generating');
      // Skyline is decorative, don't let it block
      const skylinePromise = gemini.generateCitySkyline(data.city);
      const skyline = await Promise.race([
        skylinePromise,
        new Promise<string>((resolve) => setTimeout(() => resolve(''), 5000))
      ]);
      
      const finalData = { ...data, skyline_image: skyline || undefined };
      onComplete(finalData);
    } catch (error) {
      console.error("Splash Init Error:", error);
      setStatus('error');
      // If error occurs, let them bypass after a bit or auto-fallback
      setTimeout(() => {
        const fallback: CityData = { 
          city: "Bengaluru", 
          accent_color: "#2563eb", 
          local_greeting: "ನಮಸ್ಕಾರ (Namaskara)", 
          active_language: "Kannada",
          lat: 12.9716,
          lng: 77.5946
        };
        setCityData(fallback);
        onComplete(fallback);
      }, 3000);
    }
  };

  useEffect(() => {
    init();
    // Show bypass button after 5 seconds to prevent "not loading" frustration
    bypassTimerRef.current = window.setTimeout(() => setShowBypass(true), 6000);
    return () => { if (bypassTimerRef.current) clearTimeout(bypassTimerRef.current); };
  }, [onComplete]);

  const handleBypass = () => {
    const fallback: CityData = { 
      city: "Bengaluru", 
      accent_color: "#2563eb", 
      local_greeting: "ನಮಸ್ಕಾರ (Namaskara)", 
      active_language: "Kannada",
      lat: 12.9716,
      lng: 77.5946
    };
    onComplete(fallback);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-6 z-[100] transition-all duration-700">
      {cityData?.skyline_image && (
        <img 
          src={cityData.skyline_image} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000" 
          alt="Skyline"
        />
      )}
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-[32px] flex items-center justify-center mb-8 animate-bounce shadow-2xl shadow-blue-500/20">
          <MapPin size={40} className="text-blue-400" />
        </div>
        
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">CityDNA</h1>
        
        <div className="space-y-4">
          <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px] h-4">
            {status === 'locating' && "Detecting Spatial Coordinates..."}
            {status === 'syncing' && "Linking with LokalOS Neural Net..."}
            {status === 'generating' && "Projecting Urban Metadata..."}
            {status === 'error' && "Sync Interrupted. Retrying..."}
          </p>
          
          <div className="flex gap-2 justify-center">
            {status !== 'error' ? (
              <Loader2 className="animate-spin text-blue-400" size={24} />
            ) : (
              <RefreshCw className="animate-spin text-red-400" size={24} />
            )}
          </div>

          {cityData && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-5xl font-bold mb-2 tracking-tight uppercase leading-none">{cityData.city}</h2>
              <p className="text-2xl font-light italic opacity-80">{cityData.local_greeting}</p>
            </div>
          )}

          {showBypass && !cityData && (
            <button 
              onClick={handleBypass}
              className="mt-12 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
            >
              Manual Entry <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-bold tracking-[0.4em] opacity-30 uppercase">
        Injected with Gemini 3 Flash & Neo-Banana
      </div>
    </div>
  );
};

export default CitySyncSplash;
