
import React, { useEffect, useState } from 'react';
import { gemini } from '../services/geminiService';
import { CityData, ExploreData, TouristSpot, Accommodation, FestivalAlert } from '../types';
import FanCards from './FanCards';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import {
  MapPin, Train, Car, Bus, Footprints, Clock, Ticket,
  Home, Star, CheckCircle2, Navigation2, Info, Sparkles, ChevronRight,
  CalendarDays, AlertCircle, Phone, ArrowRight
} from 'lucide-react';

interface ExploreScreenProps {
  cityData: CityData;
}

const TransportIcon = ({ mode }: { mode: string }) => {
  switch (mode) {
    case 'METRO': return <Train size={14} className="text-blue-500" />;
    case 'AUTO': return <Car size={14} className="text-orange-500" />;
    case 'BUS': return <Bus size={14} className="text-emerald-500" />;
    default: return <Footprints size={14} className="text-slate-500" />;
  }
};

const mockImages = [
  '/image.png',
  '/image1.png',
  '/image2.png',
  '/image3.png',
  '/image4.png'
];

const mockTouristSpots = [
  {
    name: "Lalbagh Botanical Garden",
    description: "Botanical garden with an aquarium and a glasshouse designed to mimic London's Crystal Palace.",
    best_time: "EARLY MORNING",
    entry_fee: "₹30",
    transport: [{ mode: "METRO", details: "Lalbagh Station (Green Line)" }, { mode: "AUTO", details: "₹50 from Majestic" }],
    coordinates: { lat: 12.9507, lng: 77.5848 }
  },
  {
    name: "Cubbon Park",
    description: "Landmark park in the city's heart with walking paths & landscaped gardens.",
    best_time: "EVENING",
    entry_fee: "FREE",
    transport: [{ mode: "METRO", details: "Cubbon Park Stn (Purple Line)" }],
    coordinates: { lat: 12.9779, lng: 77.5952 }
  },
  {
    name: "Bangalore Palace",
    description: "19th-century royal palace modeled on Windsor Castle, hosting rock concerts & amusement parks.",
    best_time: "10:00 AM",
    entry_fee: "₹230",
    transport: [{ mode: "AUTO", details: "Direct via Bellary Rd" }],
    coordinates: { lat: 12.9988, lng: 77.5921 }
  }
];

const mockStays = [
  {
    name: "ZoloStays HSR",
    type: "CO-LIVING",
    contact_status: "AVAILABLE",
    trust_score: 98,
    area: "HSR Layout",
    amenities: ["WiFi", "Meals", "Housekeeping"]
  },
  {
    name: "Stanza Living Koramangala",
    type: "PG",
    contact_status: "WAITLIST_5",
    trust_score: 92,
    area: "Koramangala",
    amenities: ["Gym", "Laundry", "Security"]
  }
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ cityData }) => {
  const [data, setData] = useState<ExploreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await gemini.getExploreData(cityData.city, cityData.lat!, cityData.lng!);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cityData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Mapping City Exploration...</p>
    </div>
  );

  return (
    <div className="py-8 space-y-12 animate-in fade-in duration-1000">
      <header className="px-4 md:px-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">
              Explore<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {cityData.city}
              </span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Newcomer Protocol • Urban Intelligence</p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Neural Link Active</span>
          </div>
        </div>
      </header>

      {/* Fan Deck Showcase */}
      <section className="py-8">
        <FanCards />
      </section>

      {/* Newcomer Quick Orientation & Breakouts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Welcome Protocol Hero */}
        <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full group-hover:bg-blue-600/30 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />

          <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                <Sparkles className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Welcome Protocol</h2>
                <div className="overflow-hidden h-4 mt-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">Syncing Orientation DNA...</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(data?.newcomer_tips) && data.newcomer_tips.slice(0, 2).map((tip, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-colors cursor-default backdrop-blur-sm group/tip">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm mb-4 group-hover/tip:scale-110 transition-transform">
                    0{i + 1}
                  </div>
                  <p className="text-lg font-medium text-slate-200 leading-relaxed italic">"{tip}"</p>
                </div>
              ))}
              {(!data?.newcomer_tips || data.newcomer_tips.length === 0) && (
                <div className="col-span-2 py-8 text-center border border-white/5 rounded-[2rem] border-dashed">
                  <p className="text-xs font-bold text-slate-500 italic uppercase">Syncing orientation DNA...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Rituals Card */}
        <div className="lg:col-span-4 bg-[#FF6B00] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
          {/* Glassmorphism Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          <div className="absolute -right-12 -top-12 opacity-20 group-hover:opacity-30 transition-opacity rotate-12">
            <CalendarDays size={240} />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between space-y-8">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="animate-spin-slow" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Nearby Rituals</h3>
            </div>

            <div className="space-y-6">
              {Array.isArray(data?.nearby_festivals) && data.nearby_festivals.slice(0, 1).map((f, i) => (
                <div key={i} className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {f.date}
                  </span>
                  <h4 className="text-3xl md:text-4xl font-black tracking-tighter leading-[0.9]">{f.name}</h4>
                  <p className="text-sm font-medium leading-relaxed opacity-90 line-clamp-3">{f.description}</p>
                </div>
              ))}
              {(!data?.nearby_festivals || data.nearby_festivals.length === 0) && (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold opacity-80 italic uppercase">No rituals detected this week.</p>
                </div>
              )}
            </div>

            <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/20 group-hover:border-white/40 flex items-center justify-center gap-2">
              View All Breakouts <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Major Sightseeing */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-blue-600 shadow-lg shadow-blue-500/30 rounded-2xl text-white">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 italic">Major Sightseeing</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Curated by Local Intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(Array.isArray(data?.tourist_spots) && data.tourist_spots.length > 0 ? data.tourist_spots : mockTouristSpots).map((spot, i) => (
            <CardContainer key={i} className="inter-var group/container" containerClassName="py-0">
              <CardBody className="bg-white hover:bg-slate-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-[2rem] p-6 border transition-all duration-500 hover:border-blue-500/50">
                <CardItem translateZ="100" className="w-full mt-4">
                  <img
                    src={mockImages[i % mockImages.length]}
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                  />
                </CardItem>
                <div className="mt-6">
                  <CardItem
                    translateZ="50"
                    className="text-3xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4"
                  >
                    {spot.name}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-sm font-medium text-slate-500 leading-relaxed mb-6"
                  >
                    {spot.description}
                  </CardItem>
                </div>

                <CardItem translateZ="80" className="w-full flex flex-wrap gap-3 mb-8">
                  <div className="px-4 py-2 bg-slate-100/50 rounded-xl flex items-center gap-2 border border-slate-200/50">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-wide">{spot.best_time}</span>
                  </div>
                  <div className="px-4 py-2 bg-slate-100/50 rounded-xl flex items-center gap-2 border border-slate-200/50">
                    <Ticket size={14} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-wide">{spot.entry_fee}</span>
                  </div>
                </CardItem>

                <CardItem translateZ="40" className="w-full space-y-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
                    <Footprints size={12} /> How to Reach
                  </span>
                  {spot.transport?.slice(0, 2).map((t, j) => (
                    <div key={j} className="flex items-start gap-4">
                      <div className="mt-1 p-1.5 bg-white rounded-lg shadow-sm text-blue-500"><TransportIcon mode={t.mode} /></div>
                      <p className="text-xs font-bold text-blue-900/70 leading-relaxed italic">{t.details}</p>
                    </div>
                  ))}
                </CardItem>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(av => (
                      <div key={av} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-slate-100">
                      +42
                    </div>
                  </div>
                  <CardItem
                    translateZ={20}
                    as="button"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates.lat},${spot.coordinates.lng}`)}
                    className="pl-6 pr-4 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-600 transition-all flex items-center gap-2 group-hover/card:scale-105"
                  >
                    Navigate <Navigation2 size={12} />
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </section>

      {/* Accommodations (Stay) with Booking simulation */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-emerald-500 shadow-lg shadow-emerald-500/30 rounded-2xl text-white"><Home size={24} /></div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 italic">Vetted Stays & PGs</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safety Audited • ONDC Verified</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(Array.isArray(data?.stays) && data.stays.length > 0 ? data.stays : mockStays).map((stay, i) => (
            <CardContainer key={i} className="inter-var group/container" containerClassName="py-0">
              <CardBody className="bg-white hover:bg-emerald-50/30 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-[2.5rem] p-8 border flex flex-col md:flex-row gap-8 items-center transition-all duration-500">
                <CardItem translateZ="100" className="w-full">
                  <img
                    src={mockImages[(i + 2) % mockImages.length]}
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                  />
                </CardItem>
                <div className="flex flex-col md:flex-row gap-8 w-full items-center">
                  <CardItem translateZ="100" className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-emerald-500 flex flex-col items-center justify-center text-white shrink-0 relative overflow-hidden shadow-2xl shadow-emerald-500/20 group-hover/card:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles size={48} /></div>
                    <span className="text-3xl md:text-4xl font-black relative z-10 tracking-tighter">{stay.trust_score}%</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] relative z-10 text-emerald-100">Trust</span>
                  </CardItem>

                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-2">
                      <CardItem translateZ="50" className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">{stay.type}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${stay.contact_status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${stay.contact_status === 'AVAILABLE' ? 'bg-blue-600 animate-pulse' : 'bg-red-600'}`} />
                          {stay.contact_status.replace('_', ' ')}
                        </span>
                      </CardItem>
                      <CardItem translateZ="60" className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{stay.name}</CardItem>
                      <CardItem as="p" translateZ="40" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> {stay.area}
                      </CardItem>
                    </div>

                    <CardItem translateZ="80" className="flex flex-wrap gap-2">
                      {stay.amenities?.slice(0, 3).map((a, k) => (
                        <div key={k} className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">{a}</span>
                        </div>
                      ))}
                    </CardItem>

                    <div className="flex gap-3 pt-2">
                      <CardItem
                        translateZ={20}
                        as="button"
                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95"
                      >
                        Check Booking <ArrowRight size={14} />
                      </CardItem>
                    </div>
                  </div>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </section>

      {/* LokalOS Grounding Protocol Banner */}
      <div className="relative group overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-800 material-shadow flex flex-col md:flex-row items-center gap-10">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000" />

        <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-2xl shadow-blue-900/50 shrink-0 relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500 border border-blue-400/30">
          <Info size={48} />
        </div>

        <div className="space-y-4 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h5 className="text-sm font-black uppercase tracking-[0.3em] text-white">LokalOS Grounding Protocol</h5>
            <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-mono text-blue-300 border border-white/10">v2.4.0-Stable</span>
          </div>

          <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-2xl">
            Explore data is sourced via <span className="text-blue-400 font-bold">Gemini Spatial Grounding</span> and verified against real-time <span className="text-emerald-400 font-bold">ONDC & RTO feeds</span>. Accommodation trust scores reflect seasonal data and neighborhood safety audits.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            {['RTO Verified', 'ONDC Network', 'Gemini 1.5 Flash', 'Real-time Traffic'].map((tag, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
