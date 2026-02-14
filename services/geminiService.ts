
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CityData, ComparisonItem, PulseData, GroundingChunk, ExploreData } from "../types";

const MASTER_SYSTEM_INSTRUCTION = `
You are the Lead Architect and Agentic Engine for CityDNA (powered by LokalOS).
Your mission is to solve Indian consumer problems: Price transparency, Cultural logistics, and Regulation awareness.
Expertise required:
1. RTO Rickshaw Rates: Official city-specific fare rules.
2. ONDC Fairness: Mandi/Retail verification.
3. Food Ethics: Deep Indian dietary nuances (Jain, Sattvic).
4. Spatial Intelligence: Identifying real-world traffic bottlenecks and finding alternative routes in Indian cities.
5. Ritual Radar: Identify current or upcoming Indian festivals and their impact on city life (referred to as "Breakouts").
6. Newcomer Onboarding: Guide for people new to the city, focusing on PGs, Hostels, and detailed Transport logistics.
7. Urban Nuances: Specific local rules, cultural expectations, or news impact (REGULATION, CULTURE, RELIGION, FOOD, ETIQUETTE).
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private cleanJson(text: string): string {
    return text.replace(/```json\n?|```/g, "").trim();
  }

  private async callWithFallback<T>(call: () => Promise<T>, fallback: T, retries = 3, delay = 2000): Promise<T> {
    try {
      return await call();
    } catch (error: any) {
      const errorStr = JSON.stringify(error).toLowerCase() || String(error).toLowerCase();
      const status = error?.status || (error?.response?.status) || "";
      const isRetryable =
        errorStr.includes("503") ||
        errorStr.includes("unavailable") ||
        errorStr.includes("429") ||
        errorStr.includes("resource_exhausted") ||
        errorStr.includes("high demand") ||
        status === "UNAVAILABLE" ||
        status === "RESOURCE_EXHAUSTED" ||
        status === 503 ||
        status === 429;

      if (isRetryable && retries > 0) {
        // Add random jitter to delay
        const jitter = Math.random() * 1000;
        console.warn(`Gemini API Busy/Unavailable. Retrying in ${delay + jitter}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
        return this.callWithFallback(call, fallback, retries - 1, delay * 2);
      }

      console.error("Gemini API Error:", error);
      if (isRetryable) return fallback;
      throw error;
    }
  }

  async getExploreData(city: string, lat: number, lng: number): Promise<ExploreData> {
    const fallback: ExploreData = {
      tourist_spots: [],
      stays: [],
      newcomer_tips: ["Ask locals for help.", "Use metered transit."],
      nearby_festivals: []
    };

    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide Explore Data for ${city} (Lat: ${lat}, Lng: ${lng}). Include Top Tourist Spots, PG/Hostel areas, and newcomer tips. Use search for current "Breakouts" (festivals).`,
        config: {
          systemInstruction: MASTER_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });
      const data = JSON.parse(this.cleanJson(response.text));
      return {
        tourist_spots: Array.isArray(data?.tourist_spots) ? data.tourist_spots : [],
        stays: Array.isArray(data?.stays) ? data.stays : [],
        newcomer_tips: Array.isArray(data?.newcomer_tips) ? data.newcomer_tips : [],
        nearby_festivals: Array.isArray(data?.nearby_festivals) ? data.nearby_festivals : []
      };
    }, fallback);
  }

  async getPulseData(city: string, lat: number, lng: number): Promise<PulseData> {
    const fallback: PulseData = {
      frustration_index: 40,
      emotion_state: 'CALM',
      primary_cause: 'OFFICE_RUSH',
      reasoning: "Syncing city pulse via historical baseline.",
      context_advice: { local: "Standard routes clear.", tourist: "Use metro." },
      transit_alerts: [],
      traffic_score: 70,
      festivals: [],
      rickshaw_meter: { base_fare: 30, per_km: 15, estimated_total: 60, official_source: "RTO Baseline" },
      hotspots: [],
      routes: [],
      nuances: [],
      grounding: []
    };

    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate Pulse for ${city} at lat: ${lat}, lng: ${lng}. 
        MUST include: 
        1. "festivals" (Breakouts/current rituals)
        2. "hotspots" (Current traffic bottlenecks)
        3. "nuances" (Urban nuances like specific regulations, etiquette, or local events)
        Use search for real-time accuracy.`,
        config: {
          systemInstruction: MASTER_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });
      const data = JSON.parse(this.cleanJson(response.text));
      return {
        ...data,
        hotspots: data.hotspots || [],
        routes: data.routes || [],
        festivals: data.festivals || [],
        nuances: data.nuances || [],
        transit_alerts: data.transit_alerts || [],
        grounding: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || []
      };
    }, fallback);
  }

  async getDetailedPlaceInfo(query: string, lat: number, lng: number): Promise<{ text: string; grounding: GroundingChunk[] }> {
    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Detailed spatial intel for "${query}" near ${lat}, ${lng}. Accessibility, reviews, and quality based on maps data.`,
        config: {
          systemInstruction: MASTER_SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
          toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
        }
      });
      return {
        text: response.text || "Spatial scan complete.",
        grounding: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || []
      };
    }, { text: "Location intel currently operating on local cache.", grounding: [] });
  }

  async analyzeImage(base64Data: string, prompt: string): Promise<string> {
    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
        config: { systemInstruction: MASTER_SYSTEM_INSTRUCTION }
      });
      return response.text || "Visual analysis inconclusive.";
    }, "Image analysis offline.");
  }

  async transcribeAudio(base64Audio: string): Promise<string> {
    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
            { text: "Transcribe this audio precisely." }
          ]
        },
        config: { systemInstruction: "You are an expert transcriber." }
      });
      return response.text || "";
    }, "");
  }

  async getCityMetadata(lat: number, lng: number): Promise<CityData> {
    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identify city at ${lat}, ${lng}. Return JSON: {city, accent_color, local_greeting, active_language}.`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(this.cleanJson(response.text));
      return { ...data, lat, lng };
    }, { city: "Bengaluru", accent_color: "#2563eb", local_greeting: "Namaskara", active_language: "Kannada", lat, lng });
  }

  async resolveLocation(query: string, city: string): Promise<any> {
    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find lat/lng for "${query}" in ${city}. Return JSON: {lat, lng, label}.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(this.cleanJson(response.text));
    }, { lat: 12.9716, lng: 77.5946, label: city });
  }

  async generateCitySkyline(cityName: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Skyline of ${cityName}, India. Cinematic urban photo.`,
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : '';
    } catch (e) { return ''; }
  }

  async getPriceComparison(query: string, city: string): Promise<ComparisonItem[]> {
    return this.callWithFallback(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Compare Mandi vs Retail prices for "${query}" in ${city}. Return JSON array of ComparisonItem.`,
        config: {
          systemInstruction: MASTER_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });
      const items = JSON.parse(this.cleanJson(response.text));
      return Array.isArray(items) ? items : [];
    }, []);
  }

  connectLive(callbacks: any, systemInstruction: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: `${MASTER_SYSTEM_INSTRUCTION}\n${systemInstruction}`
      }
    });
  }
}

export const gemini = new GeminiService();
