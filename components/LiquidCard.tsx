import React, { useState } from "react";

interface LiquidCardProps {
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
    delay?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
    highlight?: boolean;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({ title, description, badge, icon, delay = 0, action, highlight = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Unique ID for SVG filters to avoid conflicts
    const filterId = `turbulent-displace-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div
            className="service-card-wrapper w-[300px] md:w-[320px] h-[400px] md:h-[420px]"
            style={{ animationDelay: `${delay}s` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* SVG Filter for Electric Border */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id={filterId} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
                        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                            <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
                        </feOffset>

                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
                        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                            <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
                        </feOffset>

                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="2" />
                        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
                            <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
                        </feOffset>

                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="2" />
                        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
                            <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
                        </feOffset>

                        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
                        <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
                        <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

                        <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
                    </filter>
                </defs>
            </svg>

            <div className="service-card-container w-full h-full text-left">
                <div className="service-inner-container w-full h-full">
                    <div className="service-border-outer w-full h-full">
                        <div className="service-main-card w-full h-full" style={{ filter: `url(#${filterId})` }}></div>
                    </div>
                    <div className="service-glow-layer-1 w-full h-full"></div>
                    <div className="service-glow-layer-2 w-full h-full"></div>
                </div>

                <div className="service-overlay-1 w-full h-full"></div>
                <div className="service-overlay-2 w-full h-full"></div>
                <div className="service-background-glow w-full h-full"></div>

                <div className="service-content-container p-6 flex flex-col justify-between h-full">
                    <div className="flex flex-col gap-4">
                        {/* Icon */}
                        <div className={`service-icon-wrapper ${highlight ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : ''}`}>
                            {icon}
                        </div>

                        {/* Badge with Marquee */}
                        <div className="service-scrollbar-glass">
                            <div className={`service-marquee ${isHovered ? 'paused' : ''}`}>
                                <span className={highlight ? 'text-blue-200' : ''}>{badge}</span>
                                <span className={highlight ? 'text-blue-200' : ''}>{badge}</span>
                                <span className={highlight ? 'text-blue-200' : ''}>{badge}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="service-title text-2xl font-bold text-white mt-2 leading-tight">
                            {title}
                        </h3>
                    </div>

                    <div className="mt-auto">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

                        <div className="service-content-bottom p-0">
                            <p className="service-description text-sm leading-relaxed text-slate-300">
                                {description}
                            </p>
                            {action && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                                >
                                    {action.label} <span className="text-lg">→</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
