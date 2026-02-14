
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
          } ${isActive ? 'scale-105' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
        style={{
          color: isActive ? accentColor : undefined,
          backgroundColor: !isMobile && isActive ? `${accentColor}10` : 'transparent'
        }}
      >
        <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-current/10' : 'bg-transparent'}`}>
          <Icon size={isMobile ? 22 : 22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`font-black uppercase tracking-widest ${isMobile ? 'text-[8px]' : 'text-sm'}`}>
          {tab.label}
        </span>
        {!isMobile && isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[40px] p-2 flex justify-around items-center material-shadow z-50 md:hidden animate-in slide-in-from-bottom-10 duration-700">
        {tabs.map((tab) => <NavItem key={tab.id} tab={tab} isMobile={true} />)}
      </nav>

      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-white border-r border-slate-100 p-8 z-50 sticky top-0 material-shadow transition-all duration-500">
        <div className="mb-12 px-4">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="CityDNA Logo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-black tracking-widest text-slate-900 uppercase italic leading-none">CityDNA</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LokalOS Engine</p>
        </div>

        <div className="flex-1 space-y-2">
          {tabs.map((tab) => <NavItem key={tab.id} tab={tab} isMobile={false} />)}
        </div>

        <div className="mt-auto pt-8 border-t border-slate-50 space-y-4">
          <button className="flex items-center gap-4 w-full p-4 rounded-[32px] text-slate-400 hover:bg-slate-50 transition-all opacity-60 hover:opacity-100">
            <Settings size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Settings</span>
          </button>

          <div className="px-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-3 w-full px-6 py-3 bg-slate-900 text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors shadow-lg">
                  <LogIn size={16} /> Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-full border border-slate-100">
                <UserButton afterSignOutUrl="/" />
                <span className="text-xs font-bold text-slate-600 uppercase">My Profile</span>
              </div>
            </SignedIn>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
