
export enum Screen {
  SPLASH = 'SPLASH',
  DASHBOARD = 'DASHBOARD',
  COMPARE = 'COMPARE',
  COMMUNICATOR = 'COMMUNICATOR',
  EXPLORE = 'EXPLORE'
}

export interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: string[];
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface MetroLine {
  name: string;
  status: 'ON_TIME' | 'DELAYED' | 'CROWDED';
  next_train: string;
  stations: string[];
}

export interface MapIntel {
  text: string;
  chunks: GroundingChunk[];
}

export interface UrbanNuance {
  category: 'REGULATION' | 'CULTURE' | 'RELIGION' | 'FOOD' | 'ETIQUETTE';
  title: string;
  content: string;
  action_link?: string;
}

export interface FestivalAlert {
  name: string;
  date: string;
  description: string;
  impact: string;
  etiquette: string;
}

export interface TouristSpot {
  name: string;
  description: string;
  transport: {
    mode: 'METRO' | 'AUTO' | 'BUS' | 'WALK';
    details: string;
    step_by_step: string;
  }[];
  entry_fee: string;
  best_time: string;
  coordinates: { lat: number; lng: number };
}

export interface Accommodation {
  name: string;
  type: 'PG' | 'HOSTEL' | 'CO-LIVING';
  area: string;
  price_range: string;
  amenities: string[];
  trust_score: number;
  contact_status: 'AVAILABLE' | 'WAITLIST' | 'FILLING_FAST';
}

export interface ExploreData {
  tourist_spots: TouristSpot[];
  stays: Accommodation[];
  newcomer_tips: string[];
  nearby_festivals: FestivalAlert[];
}

export interface RickshawRate {
  base_fare: number;
  per_km: number;
  estimated_total: number;
  official_source: string;
}

export interface TrafficHotspot {
  lat: number;
  lng: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface AlternativeRoute {
  id: string;
  name: string;
  points: [number, number][];
  duration: string;
  description: string;
}

export interface CityData {
  city: string;
  accent_color: string;
  local_greeting: string;
  active_language: string;
  skyline_image?: string;
  lat?: number;
  lng?: number;
}

export interface PulseData {
  frustration_index: number;
  emotion_state: 'CALM' | 'ANXIOUS' | 'ANGRY' | 'FESTIVE' | 'CHAOTIC';
  reasoning: string;
  primary_cause: 'ACCIDENT' | 'FESTIVAL' | 'VIP_MOVEMENT' | 'RAIN' | 'OFFICE_RUSH' | 'CONSTRUCTION';
  context_advice: {
    local: string;
    tourist: string;
  };
  transit_alerts: string[];
  traffic_score: number;
  nuances: UrbanNuance[];
  festivals: FestivalAlert[];
  metro_lines?: MetroLine[];
  rickshaw_meter?: RickshawRate;
  hotspots: TrafficHotspot[];
  routes: AlternativeRoute[];
  grounding?: GroundingChunk[];
  traffic_emotion?: {
    description: string;
  };
}

export interface ComparisonItem {
  id: string;
  name: string;
  mandi_price: number;
  ecommerce_price: number;
  delivery_speed: string;
  local_trust: number;
  social_value_score: number;
  fairness_reasoning: string;
}

export interface AppState {
  currentScreen: Screen;
  location: { lat: number; lng: number } | null;
  cityData: CityData | null;
  pulse: PulseData | null;
  loading: boolean;
  error: string | null;
  communicatorContext?: {
    itemName: string;
    targetPrice: number;
    currentPrice: number;
    reasoning: string;
  };
}
