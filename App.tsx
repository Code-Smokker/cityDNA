
import React, { useState } from 'react';
import { AppState, Screen, CityData } from './types';
import CitySyncSplash from './components/CitySyncSplash';
import PulseDashboard from './components/PulseDashboard';
import BharatCompare from './components/BharatCompare';
import CommunicatorScreen from './components/CommunicatorScreen';
import { ExploreScreen } from './components/ExploreScreen';
import Navigation from './components/Navigation';
import { ClerkProvider } from '@clerk/clerk-react';

/// <reference types="vite/client" />
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentScreen: Screen.SPLASH,
    location: null,
    cityData: null,
    pulse: null,
    loading: false,
    error: null,
  });

  const handleSplashComplete = (cityData: CityData) => {
    setState(prev => ({
      ...prev,
      cityData,
      currentScreen: Screen.DASHBOARD
    }));
  };

  const setScreen = (screen: Screen) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  };

  const startNegotiation = (context: AppState['communicatorContext']) => {
    setState(prev => ({
      ...prev,
      currentScreen: Screen.COMMUNICATOR,
      communicatorContext: context
    }));
  };

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans select-none overflow-x-hidden transition-colors duration-500">
        {state.currentScreen === Screen.SPLASH && (
          <CitySyncSplash onComplete={handleSplashComplete} />
        )}

        {state.cityData && (
          <div className="relative h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Persistent Navigation (Desktop Sidebar / Mobile Bottom Bar handled in component) */}
            <Navigation
              currentScreen={state.currentScreen}
              setScreen={setScreen}
              accentColor={state.cityData.accent_color}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-48 md:pb-12 md:pt-4">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {state.currentScreen === Screen.DASHBOARD && (
                  <PulseDashboard cityData={state.cityData} />
                )}
                {state.currentScreen === Screen.EXPLORE && (
                  <ExploreScreen cityData={state.cityData} />
                )}
                {state.currentScreen === Screen.COMPARE && (
                  <BharatCompare
                    cityData={state.cityData}
                    onStartNegotiation={startNegotiation}
                  />
                )}
                {state.currentScreen === Screen.COMMUNICATOR && (
                  <CommunicatorScreen
                    cityData={state.cityData}
                    context={state.communicatorContext}
                  />
                )}
              </div>
            </main>

            {/* Subtle Accent Glow - Brightened */}
            <div
              className="fixed top-0 left-0 w-full h-24 md:h-32 pointer-events-none z-0 opacity-40 transition-all duration-1000 mix-blend-soft-light"
              style={{ background: `linear-gradient(to bottom, ${state.cityData?.accent_color}, transparent)` }}
            />
          </div>
        )}
      </div>
    </ClerkProvider>
  );
};

export default App;
