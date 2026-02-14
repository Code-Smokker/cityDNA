# 🧬 CityDNA: The Living Operating System for Cities (LokalOS)

> **"Experience a city before you even step foot in it."**

CityDNA is a next-generation urban intelligence dashboard designed to decode the "DNA" of Indian cities. It moves beyond static maps to provide a **living, breathing pulse** of the city—capturing its emotional state, cultural rhythm, and hyper-local nuances.

Built with a **Liquid Glass** aesthetic, it combines real-time data, AI agents, and cultural context to help newcomers, migrants, and explorers navigate the chaotic beauty of Indian cities with confidence.

---

## ✨ Key Features

### 1. 🏙️ Pulse Dashboard (The City's Heartbeat)
A real-time command center that visualizes the current state of the city.
-   **Traffic Emotion Intelligence**: Analyzes live traffic patterns to determine the "mood" of the roads (e.g., "High Frustration" vs. "Flow State").
-   **Ritual Radar**: Tracks local festivals, processions, and cultural events that impact mobility and social etiquette.
-   **Safety Heatmap**: Context-aware safety scores based on time, crowd density, and lighting using `LokalOS` logic.
-   **Urban Nuances**: Hyper-local tips on food zones (e.g., "Strict Veg Area"), religion, and regulations.

### 2. 🗣️ Communicator & Lens (Neural Bridge)
Break down language and cultural barriers instantly.
-   **Voice Bridge**: Real-time, bi-directional voice translation for seamless conversations with locals (Auto drivers, Shopkeepers).
-   **Visual Lens**: Point your camera at menus, signs, or landmarks. The AI decodes the visual data, translates text, and explains the cultural context behind it.
-   **CityDNA Branding**: Custom UI with side-by-side logo and bold typography.

### 3. 🧭 Explore Screen (The Newcomer Protocol)
Curated pathways for settling in and exploring.
-   **Vetted Stays**: AI-verified PG and Co-living options with "Trust Scores" based on safety audits.
-   **Transport DNA**: Best ways to reach spots (Metro vs. Auto vs. Bus) with estimated fares.
-   **Hidden Gems**: "Fan Card" showcase of major sightseeing spots with historical context.

### 4. 🛒 Market (Fair Price Discovery)
*(Coming Soon)*
-   **Price Watch**: Compare local service rates to avoid "newcomer tax".
-   **Consumer Intelligence**: Predict surge pricing trends.

---

## 🛠️ Tech Stack

-   **Frontend**: React (v18), Vite, TypeScript
-   **Styling**: Tailwind CSS (Glassmorphism, Animate.css), Lucide React Icons
-   **AI & Intelligence**: Google Gemini 1.5 Flash (Multimodal: Text, Image, Spatial)
-   **Maps**: Leaflet, OpenStreetMap
-   **Authentication**: Clerk
-   **UI Components**: Custom "Liquid Glass" cards, 3D transformations.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   npm or yarn
-   A Clerk Account (for Auth)
-   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Code-Smokker/cityDNA.git
    cd cityDNA
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
    VITE_GEMINI_API_KEY=AIzaSy...
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 🎨 Design Philosophy: "Liquid Glass"

The UI is inspired by the fluidity of water and glass.
-   **Translucency**: Backgrounds allow the city's "accent color" (a glowing ambient aura) to shine through, changing based on the selected city's vibe (e.g., Bangalore Green, Mumbai Gold).
-   **Motion**: Smooth transitions, floating cards, and "zoom-in" effects create a feeling of alive-ness.
-   **Typography**: Bold, uppercase headers (`Inter`, `System UI`) for a futuristic, command-center aesthetic.

---

## 🤝 Contributing

We welcome contributions to the LokalOS Engine!
1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

**Developed with ❤️ by the CityDNA Team** - *Decoding the Urban Chaos.*
