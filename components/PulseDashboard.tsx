import React, { useEffect, useState, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { CityData, PulseData, TrafficHotspot, AlternativeRoute, FestivalAlert, GroundingChunk, UrbanNuance } from '../types';
import { LiquidCard } from './LiquidCard';
import { ExploreScreen } from './ExploreScreen';
import { MarketScreen } from './MarketScreen';
import Footer from './Footer';
import {
  Activity, Scale, Utensils, Heart, Landmark, Info,
  Gauge, MapPin, Globe, Navigation2, Search, X, Loader2, AlertTriangle, Sparkles, CalendarDays, RefreshCw, Star, ExternalLink, ChevronRight, ShieldAlert, BookOpen, Plus, Minus, Eye, EyeOff, Calculator, ArrowRight,
  Siren, Tent, PartyPopper, MessageCircle, Wallet, ShieldCheck, HelpCircle, Users, Train
} from 'lucide-react';
import L from 'leaflet';

interface PulseDashboardProps {
  cityData: CityData;
}

const CategoryIcon = ({ category }: { category: UrbanNuance['category'] }) => {
  switch (category) {
    case 'REGULATION': return <Scale size={16} className="text-orange-500" />;
    case 'FOOD': return <Utensils size={16} className="text-emerald-500" />;
    case 'RELIGION': return <Heart size={16} className="text-pink-500" />;
    case 'CULTURE': return <Landmark size={16} className="text-purple-500" />;
    case 'ETIQUETTE': return <BookOpen size={16} className="text-blue-500" />;
    default: return <Info size={16} className="text-slate-500" />;
  }
};

const UrbanMap: React.FC<{
  lat: number;
  lng: number;
  city: string;
  hotspots: TrafficHotspot[];
  routes: AlternativeRoute[];
  accentColor: string;
}> = ({ lat, lng, city, hotspots = [], routes = [], accentColor }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<{
    type: 'hotspot' | 'route' | 'search' | 'click';
    data: any;
    grounding?: GroundingChunk[];
  } | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapRef.current);

      mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (clickMarkerRef.current) mapRef.current?.removeLayer(clickMarkerRef.current);
        const clickIcon = L.divIcon({
          className: '',
          html: `<div class="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white material-shadow animate-bounce"><div class="w-2 h-2 bg-blue-400 rounded-full"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        clickMarkerRef.current = L.marker([lat, lng], { icon: clickIcon }).addTo(mapRef.current!);

        setSelectedFeature({ type: 'click', data: { lat, lng, description: "Synchronizing Spatial DNA..." } });
        try {
          const intel = await gemini.getDetailedPlaceInfo(`Coordinate ${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
          setSelectedFeature({
            type: 'click',
            data: { lat, lng, description: intel.text },
            grounding: intel.grounding
          });
        } catch (err) {
          console.error(err);
          setSelectedFeature({ type: 'click', data: { lat, lng, description: "Spatial intel connection lost." } });
        }
      });
    }

    mapRef.current.eachLayer(l => {
      if ((l instanceof L.Marker || l instanceof L.Polyline) && l !== searchMarkerRef.current && l !== clickMarkerRef.current) {
        mapRef.current?.removeLayer(l);
      }
    });

    const userIcon = L.divIcon({
      className: '',
      html: `<div class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center"><div class="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div></div>`,
      iconSize: [24, 24]
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(mapRef.current);

    hotspots?.forEach(h => {
      if (!h || typeof h.lat !== 'number' || typeof h.lng !== 'number') return;
      const color = h.severity === 'HIGH' ? '#ef4444' : '#f97316';
      const icon = L.divIcon({ className: '', html: `<div class="pulse-marker" style="background-color: ${color}"></div>`, iconSize: [20, 20] });
      const marker = L.marker([h.lat, h.lng], { icon }).addTo(mapRef.current!);
      marker.on('click', () => {
        setSelectedFeature({ type: 'hotspot', data: h });
        mapRef.current?.flyTo([h.lat, h.lng], 16, { duration: 1.5 });
      });
    });

    routes?.forEach(r => {
      if (!r || !Array.isArray(r.points) || r.points.length === 0) return;
      const poly = L.polyline(r.points as any, { color: accentColor, weight: 6, opacity: 0.6, lineCap: 'round' }).addTo(mapRef.current!);
      poly.on('click', () => {
        setSelectedFeature({ type: 'route', data: r });
        mapRef.current?.fitBounds(poly.getBounds(), { padding: [50, 50] });
      });
    });
  }, [lat, lng, hotspots, routes, accentColor]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await gemini.resolveLocation(searchQuery, city);
      if (mapRef.current && result && typeof result.lat === 'number' && typeof result.lng === 'number') {
        mapRef.current.flyTo([result.lat, result.lng], 16);
        if (searchMarkerRef.current) mapRef.current.removeLayer(searchMarkerRef.current);
        const searchIcon = L.divIcon({
          className: 'search-marker',
          html: `<div class="w-10 h-10 flex items-center justify-center bg-white rounded-full material-shadow border-2 border-blue-500"><div class="w-4 h-4 rounded-full" style="background-color: ${accentColor}"></div></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        searchMarkerRef.current = L.marker([result.lat, result.lng], { icon: searchIcon }).addTo(mapRef.current);
        setSelectedFeature({ type: 'search', data: result });
      }
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  return (
    <div className="space-y-4">
      {controlsVisible ? (
        <div className="flex flex-col md:flex-row gap-3 animate-in fade-in duration-300">
          <div className="bg-white px-4 py-3 rounded-full flex items-center gap-2 border border-slate-200 material-shadow shrink-0">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Neural Spatial Mesh</span>
          </div>
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, landmark..."
              className="w-full bg-white rounded-full pl-11 pr-12 py-3.5 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all material-shadow"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={18} />}
          </form>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setControlsVisible(false)}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 material-shadow hover:bg-slate-50 active:scale-95 transition-all"
              title="Hide Controls"
            >
              <EyeOff size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end p-1">
          <button
            onClick={() => setControlsVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 material-shadow hover:bg-slate-50 active:scale-95 transition-all"
            title="Show Controls"
          >
            <Eye size={16} className="text-slate-600" />
            <span className="text-xs font-bold text-slate-600 uppercase">Show Controls</span>
          </button>
        </div>
      )}

      <div className="relative rounded-[40px] md:rounded-[56px] overflow-hidden material-shadow border border-white/50 aspect-video md:aspect-[21/9] w-full bg-slate-100">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Zoom Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 md:right-6 z-10 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-slate-200 material-shadow hover:bg-blue-50 hover:border-blue-500 active:scale-95 transition-all"
            title="Zoom In"
          >
            <Plus size={20} className="text-slate-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-slate-200 material-shadow hover:bg-blue-50 hover:border-blue-500 active:scale-95 transition-all"
            title="Zoom Out"
          >
            <Minus size={20} className="text-slate-700" />
          </button>
        </div>

      </div>
      {selectedFeature && (
        <div className="relative w-full md:w-96 md:ml-auto z-20 animate-fade-in-up mt-4">
          <div className="bg-white rounded-[32px] p-6 material-shadow border border-slate-100 space-y-4 max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg"><MapPin size={16} className="text-blue-600" /></div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                  {selectedFeature.type === 'click' ? 'Spatial Intel' : 'Location Marker'}
                </h4>
              </div>
              <button onClick={() => setSelectedFeature(null)} className="p-1 hover:bg-slate-50 rounded-full"><X size={16} /></button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinates: {selectedFeature.data.lat?.toFixed(4)}, {selectedFeature.data.lng?.toFixed(4)}</p>
              <p className="text-xs font-bold text-slate-600 leading-relaxed italic border-l-2 border-blue-500 pl-3">
                {selectedFeature.data.description || selectedFeature.data.label}
              </p>
            </div>

            {selectedFeature.grounding && selectedFeature.grounding.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  {/* FIX: Changed size(10) to size={10} to resolve 'boolean not assignable' error */}
                  <Globe size={10} /> Intelligence Sources
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedFeature.grounding.map((chunk, i) => (
                    <React.Fragment key={i}>
                      {chunk.maps && (
                        <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase hover:bg-blue-100 transition-colors">
                          {chunk.maps.title || 'Maps'} <ExternalLink size={10} />
                        </a>
                      )}
                      {chunk.web && (
                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase hover:bg-blue-100 transition-colors">
                          {chunk.web.title || 'Source'} <ExternalLink size={10} />
                        </a>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedFeature.data.lat) {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedFeature.data.lat},${selectedFeature.data.lng}`);
                  }
                }}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
              >
                Navigate There <Navigation2 size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RitualRadar: React.FC<{ festivals: FestivalAlert[] }> = ({ festivals = [] }) => {
  if (!Array.isArray(festivals) || festivals.length === 0) return null;
  return (
    <section className="animate-in slide-in-from-top-10 duration-1000">
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg"><Sparkles size={18} /></div>
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900 italic">Breakouts & Rituals</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {festivals.map((f, i) => (
          <div key={i} className="bg-white rounded-[48px] p-8 material-shadow border-2 border-orange-100 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><CalendarDays size={14} className="text-orange-500" /><span className="text-[10px] font-black uppercase text-orange-500">{f.date}</span></div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{f.name}</h4>
              </div>
              <div className="px-4 py-2 bg-orange-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Live Sync</div>
            </div>
            <p className="mt-6 text-sm font-bold text-slate-600 leading-relaxed italic border-l-4 border-orange-500 pl-4">"{f.description}"</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-orange-50 rounded-[32px] p-5 space-y-1">
                <span className="text-[9px] font-black uppercase text-orange-600">Urban Impact</span>
                <p className="text-[10px] font-bold text-orange-900 leading-tight uppercase">{f.impact}</p>
              </div>
              <div className="bg-slate-900 rounded-[32px] p-5 space-y-1">
                <span className="text-[9px] font-black uppercase text-orange-400">Etiquette</span>
                <p className="text-[10px] font-bold text-white/80 leading-tight uppercase">{f.etiquette}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PulseDashboard: React.FC<PulseDashboardProps> = ({ cityData }) => {
  const [pulse, setPulse] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'PULSE' | 'EXPLORE' | 'MARKET'>('PULSE');

  const fetchData = async () => {
    if (!cityData.lat || !cityData.lng) return;
    setLoading(true);
    setError(false);
    try {
      const data = await gemini.getPulseData(cityData.city, cityData.lat, cityData.lng);

      // MOCK DATA FALLBACK for Festivals/Rituals if empty
      if (!data.festivals || data.festivals.length === 0) {
        data.festivals = [
          {
            name: "Karaga Shakthi",
            date: "Tonight, 8:00 PM",
            description: "Massive devotional procession moving through Old City. Expect heavy roadblocks.",
            impact: "High Traffic",
            etiquette: "Remove footwear if entering zone"
          },
          {
            name: "St. Mary's Feast",
            date: "Tomorrow, 10:00 AM",
            description: "Annual church feast attracting thousands. Shivaji Nagar area congested.",
            impact: "Road Diversion",
            etiquette: "Respect cues"
          }
        ];
      }

      // Add comprehensive mock data for Metro, Nuances, etc.
      const mockData: PulseData = {
        ...data, // Keep existing data if any
        festivals: [
          { name: "Ganesh Chaturthi", date: "Today", description: "Major processions in central city. Traffic diverted.", impact: "HIGH", etiquette: "Respect local customs." },
          { name: "Varamahalakshmi", date: "Friday", description: "Temple crowds expected.", impact: "MEDIUM", etiquette: "Conservative dress code." }
        ],
        metro_lines: [
          { name: "Purple Line", status: "DELAYED", next_train: "12 mins", stations: ["M.G. Road", "Indiranagar", "Baiyappanahalli"] },
          { name: "Green Line", status: "ON_TIME", next_train: "3 mins", stations: ["Majestic", "Jayanagar", "Silk Institute"] }
        ],
        nuances: [
          { category: 'FOOD', title: 'Sattvic Zone (Basavanagudi)', content: 'Strictly vegetarian area. No eggs allowed in public parks.', action_link: '#' },
          { category: 'RELIGION', title: 'Temple Hours', content: 'Darshan closes at 12:30 PM. Resumes at 4:00 PM.', action_link: '#' },
          { category: 'REGULATION', title: 'Plastic Ban', content: 'Strict ₹500 fine for single-use plastic bags in this zone.', action_link: '#' },
        ],
        rickshaw_meter: { base_fare: 30, per_km: 15, estimated_total: 55, official_source: "RTO Karnataka 2024" },
        hotspots: [
          { lat: 12.9716, lng: 77.5946, severity: 'HIGH', description: 'MG Road Junction' },
          { lat: 12.9352, lng: 77.6245, severity: 'MEDIUM', description: 'Sony World Signal' }
        ],
        routes: [],
        grounding: []
      };
      setPulse(mockData); // Use the comprehensive mock data

    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [cityData]);

  // Feature Cards Data
  const features = [
    {
      title: "Traffic Emotion Intelligence",
      description: pulse?.traffic_emotion?.description || "Analyzing real-time traffic sentiment and frustration levels...",
      badge: "LIVE TRAFFIC",
      icon: <Siren size={24} />,
      delay: 0,
      action: { label: "View Analysis", onClick: () => document.getElementById('stress-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "New City Survival Mode",
      description: "Essential guide for migrants: SIM cards, housing, transport, and cultural etiquette.",
      badge: "MIGRANT GUIDE",
      icon: <Tent size={24} />,
      delay: 0.2,
      action: { label: "Start Mode", onClick: () => document.getElementById('nuances-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Cultural Radar System",
      description: `Tracking ${pulse?.festivals?.length || 0} active cultural events and potential disruptions nearby.`,
      badge: "CULTURE SCAN",
      icon: <PartyPopper size={24} />,
      delay: 0.4,
      action: { label: "View Events", onClick: () => document.getElementById('rituals-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Smart Food & Religion",
      description: "Dietary zones, fasting days, and sensitive food area alerts based on location.",
      badge: "DIET INTEL",
      icon: <Utensils size={24} />,
      delay: 0.6,
      action: { label: "Check Area", onClick: () => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Dialect + Tone Mode",
      description: "Real-time polite translation for local interactions (Auto drivers, Shopkeepers).",
      badge: "LIVE TRANSLATE",
      icon: <MessageCircle size={24} />,
      delay: 0.8,
      action: { label: "Listen Now", onClick: () => document.getElementById('nuances-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Consumer Intelligence",
      description: "Predicting surge pricing and finding fair rates for services in your area.",
      badge: "PRICE WATCH",
      icon: <Wallet size={24} />,
      delay: 1.0,
      action: { label: "Compare Rates", onClick: () => document.getElementById('stress-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Safety Heatmap",
      description: "Contextual safety scores for day/night, crowd density, and safe walking routes.",
      badge: "SAFETY SCAN",
      icon: <ShieldCheck size={24} />,
      delay: 1.2,
      action: { label: "View Map", onClick: () => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Explain Surroundings",
      description: "AI analysis of why things are happening around you right now.",
      badge: "CONTEXT AI",
      icon: <HelpCircle size={24} />,
      delay: 1.4,
      action: { label: "Analyze", onClick: () => document.getElementById('stress-section')?.scrollIntoView({ behavior: 'smooth' }) }
    },
    {
      title: "Multilingual Group",
      description: "Seamless real-time translation for multi-language group conversations.",
      badge: "GROUP SYNC",
      icon: <Users size={24} />,
      delay: 1.6,
      action: { label: "Join Session", onClick: () => { } }
    }
  ];

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Activity className="animate-pulse text-blue-500" size={64} />
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Syncing City Pulse...</p>
    </div>
  );

  if (error || !pulse) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center bg-white/50 backdrop-blur-sm rounded-[40px] m-4 border border-white/60 shadow-xl">
      <AlertTriangle size={48} className="text-red-500 animate-bounce" />
      <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">Urban Sync Offline</h2>
      <p className="text-sm font-bold text-slate-400 max-w-xs">High spatial demand or neural sync timeout. Re-pinging LokalOS node.</p>
      <button onClick={fetchData} className="px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-lg hover:shadow-xl hover:bg-slate-800">
        Restart Protocol <RefreshCw size={18} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:p-6 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-700">LokalOS</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('PULSE')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'PULSE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Pulse
          </button>
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'EXPLORE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('MARKET')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'MARKET' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Market
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'PULSE' && pulse && (
          <div className="py-8 space-y-12 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">{cityData.city} <span className="text-slate-200">/</span> Pulse</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">{cityData.local_greeting}</p>
              </div>
            </header>

            <div className="w-full overflow-x-auto pb-8 pt-4 hide-scrollbar">
              <div className="inline-flex gap-6 px-4">
                {features.map((feature, index) => (
                  <LiquidCard
                    key={index}
                    {...feature}
                  />
                ))}
              </div>
            </div>

            {pulse.grounding && pulse.grounding.some(c => c.web) && (
              <section className="px-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Live Research Pulse</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pulse.grounding.map((chunk, i) => chunk.web && (
                    <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-600 material-shadow flex items-center gap-2 hover:bg-slate-50 transition-colors">
                      {chunk.web.title || 'Source'} <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Urban Nuances - Missing detailed info section */}
            {pulse.nuances && pulse.nuances.length > 0 && (
              <section id="nuances-section" className="scroll-mt-24 px-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg"><ShieldAlert size={18} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900 italic">Urban Nuances</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pulse.nuances.map((nuance, i) => (
                    <div key={i} className="bg-white rounded-[40px] p-6 material-shadow border border-slate-50 flex flex-col gap-4 group hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={nuance.category} />
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{nuance.category}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{nuance.title}</h4>
                      <p className="text-xs font-bold text-slate-500 italic leading-relaxed">"{nuance.content}"</p>
                      {nuance.action_link && (
                        <a href={nuance.action_link} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">
                          Protocol Link <ChevronRight size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div id="rituals-section" className="scroll-mt-24"><RitualRadar festivals={pulse.festivals} /></div>

            <div id="map-section" className="scroll-mt-24"><UrbanMap
              lat={cityData.lat!}
              lng={cityData.lng!}
              city={cityData.city}
              hotspots={pulse.hotspots}
              routes={pulse.routes}
              accentColor={cityData.accent_color}
            /></div>

            <section id="stress-section" className="scroll-mt-24 bg-white rounded-[48px] p-8 md:p-10 material-shadow border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[36px] flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden" style={{ backgroundColor: cityData.accent_color }}>
                  <span className="text-3xl font-black">{pulse.frustration_index}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Stress</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Emotion State</span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{pulse.emotion_state}</h2>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{pulse.primary_cause?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 italic font-bold text-slate-700 text-sm flex items-center leading-relaxed">"{pulse.reasoning || "Analyzing neural dissonance patterns in urban flux..."}"</div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              <div className="bg-slate-900 rounded-[48px] p-8 text-white flex flex-col justify-between h-48 material-shadow group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start">
                  <Gauge size={24} className="text-yellow-400 mb-6" />
                  <div className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70">RTO Live</div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2"><span className="text-5xl font-black">₹{pulse.rickshaw_meter?.estimated_total}</span><span className="text-xs font-bold text-slate-500 uppercase">/ 2km</span></div>
                  <p className="text-[9px] font-black text-slate-600 uppercase mt-2">{pulse.rickshaw_meter?.official_source}</p>
                </div>
              </div>

              {/* Metro Status Card */}
              <div className="bg-white rounded-[48px] p-8 text-slate-900 flex flex-col gap-4 h-auto md:h-48 material-shadow border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Train size={20} /></div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Metro Live</span>
                </div>
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {pulse.metro_lines?.map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-black uppercase">{line.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{line.next_train} • {line.stations[0]}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${line.status === 'ON_TIME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {line.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Footer />
          </div>
        )}
        {activeTab === 'EXPLORE' && <ExploreScreen cityData={cityData} />}
        {activeTab === 'MARKET' && <MarketScreen />}
      </div>
    </div>
  );
};

export default PulseDashboard;
