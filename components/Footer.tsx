import React from 'react';
import { Heart, Globe, Shield } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 rounded-t-[40px] mt-12 material-shadow">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <h3 className="text-white font-black uppercase tracking-widest text-lg mb-4">CityDNA</h3>
                    <p className="text-xs leading-relaxed opacity-70">
                        Powered by LokalOS Neural Engine. <br />
                        Real-time urban sensing and hyperlocal intelligence.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Data Sources</h4>
                    <ul className="space-y-2 text-xs">
                        <li className="flex items-center gap-2"><Globe size={12} /> Gemini Spatial Grounding</li>
                        <li className="flex items-center gap-2"><Shield size={12} /> ONDC Retail Network</li>
                        <li className="flex items-center gap-2"><Heart size={12} /> Community Verified</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Legal</h4>
                    <ul className="space-y-2 text-xs opacity-70">
                        <li className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Data Ethics</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    © 2024 CityDNA Inc. All Systems Operational.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
