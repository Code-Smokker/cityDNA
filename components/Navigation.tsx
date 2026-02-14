
import React from 'react';
import { Screen } from '../types';
import { LayoutDashboard, ShoppingBag, Languages, Compass, Settings, LogIn, ScanLine } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

interface NavigationProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  accentColor: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, setScreen, accentColor }) => {
  const tabs = [
    { id: Screen.DASHBOARD, icon: LayoutDashboard, label: 'Pulse' },
    { id: Screen.EXPLORE, icon: Compass, label: 'Explore' },
    { id: Screen.COMPARE, icon: ShoppingBag, label: 'Market' },
    { id: Screen.COMMUNICATOR, icon: ScanLine, label: 'Communicator' },
  ];

  const NavItem = ({ tab, isMobile }: { tab: any, isMobile: boolean }) => {
    const isActive = currentScreen === tab.id;
    const Icon = tab.icon;
    return (
      <button
        onClick={() => setScreen(tab.id)}
        className={`flex items-center gap-3 transition-all duration-500 ease-out group ${isMobile
          ? 'flex-col p-3 rounded-[24px]'
          : 'w-full p-4 mb-2 rounded-[32px]'
          } ${isActive ? 'scale-105 bg-black/5 text-black font-black shadow-sm' : 'opacity-60 text-slate-600 hover:opacity-100 hover:text-black hover:bg-black/5'}`}
      >
        <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-black/10' : 'bg-transparent group-hover:bg-black/5'}`}>
          <Icon size={isMobile ? 22 : 22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`uppercase tracking-widest ${isMobile ? 'text-[8px] font-bold' : 'text-sm font-bold'}`}>
          {tab.label}
        </span>
        {!isMobile && isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-slate-300/60 backdrop-blur-2xl border border-slate-400/20 rounded-[40px] p-2 flex justify-around items-center material-shadow z-50 md:hidden animate-in slide-in-from-bottom-10 duration-700">
        {tabs.map((tab) => <NavItem key={tab.id} tab={tab} isMobile={true} />)}
      </nav>

      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-slate-300/50 backdrop-blur-3xl border-r border-slate-400/20 p-6 z-50 sticky top-0 shadow-2xl transition-all duration-500">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="CityDNA Logo" className="h-10 w-10 object-contain drop-shadow-xl" />
            <span className="text-xl font-black tracking-widest text-slate-900 uppercase italic leading-none drop-shadow-sm">CityDNA</span>
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] font-black text-black uppercase tracking-[0.2em]">LokalOS Engine v2.4</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {tabs.map((tab) => <NavItem key={tab.id} tab={tab} isMobile={false} />)}
        </div>

        <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
          <button className="flex items-center gap-4 w-full p-4 rounded-[24px] text-slate-800 hover:bg-white/20 hover:text-black transition-all font-bold uppercase tracking-widest text-xs group">
            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Settings</span>
          </button>

          <div className="px-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-3 w-full px-6 py-4 bg-slate-900/90 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
                  <LogIn size={16} /> Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3 p-1.5 pl-2 bg-white/40 rounded-full border border-white/20 shadow-sm backdrop-blur-md">
                <UserButton afterSignOutUrl="/" />
                <span className="text-[10px] font-black text-black uppercase tracking-widest">Operator</span>
              </div>
            </SignedIn>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
