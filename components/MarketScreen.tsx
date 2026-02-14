import React, { useState } from 'react';
import { Search, Mic, ShoppingCart, Clock, TrendingUp, ChevronRight, Star, Zap, MapPin, ArrowRight } from 'lucide-react';

interface Offer {
    retailer: string;
    price: number;
    delivery: string;
    rating: number;
    delivery_charge?: number;
}

interface Product {
    id: string;
    name: string;
    image: string;
    attributes: { weight: string; quality: string };
    offers: Offer[];
    price_history?: number[]; // Mock for sparkline
}

const mockComparisonData: Product[] = [
    {
        id: "prod_001",
        name: "Farm Fresh Tomatoes",
        image: "/image.png", // Using existing mock image
        attributes: { weight: "500g", quality: "Organic" },
        offers: [
            { retailer: "Local Mandi", price: 22, delivery: "20 mins", rating: 4.5, delivery_charge: 0 },
            { retailer: "Zepto", price: 28, delivery: "10 mins", rating: 4.8, delivery_charge: 15 },
            { retailer: "BigBasket", price: 25, delivery: "Tomorrow", rating: 4.2, delivery_charge: 0 }
        ]
    },
    {
        id: "prod_002",
        name: "Amul Taaza Milk",
        image: "/image1.png",
        attributes: { weight: "500ml", quality: "Toned" },
        offers: [
            { retailer: "Blinkit", price: 27, delivery: "8 mins", rating: 4.9, delivery_charge: 15 },
            { retailer: "MilkSub", price: 26, delivery: "7:00 AM", rating: 4.6, delivery_charge: 0 },
            { retailer: "Zepto", price: 27, delivery: "12 mins", rating: 4.8, delivery_charge: 15 }
        ]
    },
    {
        id: "prod_003",
        name: "Aashirvaad Atta",
        image: "/image2.png",
        attributes: { weight: "5kg", quality: "Whole Wheat" },
        offers: [
            { retailer: "D-Mart Ready", price: 210, delivery: "2 Days", rating: 4.3, delivery_charge: 49 },
            { retailer: "Swiggy Instamart", price: 245, delivery: "15 mins", rating: 4.7, delivery_charge: 0 },
            { retailer: "Amazon Fresh", price: 230, delivery: "Tomorrow", rating: 4.5, delivery_charge: 0 }
        ]
    }
];

export const MarketScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const filteredProducts = mockComparisonData.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getBestOffer = (offers: Offer[], criteria: 'price' | 'time') => {
        if (criteria === 'price') {
            return offers.reduce((prev, curr) => (curr.price + (curr.delivery_charge || 0)) < (prev.price + (prev.delivery_charge || 0)) ? curr : prev);
        }
        // Simple mock logic for time: just checking for "mins"
        return offers.find(o => o.delivery.includes('mins')) || offers[0];
    };

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-700">
            {/* Search Header */}
            <div className="bg-white rounded-[2.5rem] p-2 shadow-xl shadow-slate-200/50 flex items-center border border-slate-100 relative z-20">
                <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search 'Tomatoes' or 'Atta'..."
                    className="flex-1 bg-transparent border-none outline-none px-4 text-lg font-medium placeholder:text-slate-300 text-slate-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                    <Mic size={20} />
                </button>
            </div>

            {/* Results / Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                    const bestPrice = getBestOffer(product.offers, 'price');
                    const fastest = getBestOffer(product.offers, 'time');

                    return (
                        <div key={product.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                            {/* Product Header */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-slate-50 p-2 shrink-0">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl mix-blend-multiply" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{product.name}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wide">{product.attributes.weight}</span>
                                        <span className="px-2 py-1 bg-green-50 rounded-lg text-[10px] font-bold text-green-600 uppercase tracking-wide">{product.attributes.quality}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison List */}
                            <div className="space-y-3">
                                {product.offers.map((offer, idx) => {
                                    const isBestPrice = offer.retailer === bestPrice.retailer;
                                    const isFastest = offer.retailer === fastest.retailer && offer.delivery.includes('mins');

                                    return (
                                        <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${isBestPrice ? 'bg-green-50/50 border-green-200' : isFastest ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-100'
                                            }`}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900">{offer.retailer}</span>
                                                    <div className="flex gap-1">
                                                        {isBestPrice && <span className="px-1.5 py-0.5 bg-green-200 text-green-800 text-[8px] font-black uppercase rounded-md tracking-wider">Best Value</span>}
                                                        {isFastest && !isBestPrice && <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-[8px] font-black uppercase rounded-md tracking-wider">Fastest</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {offer.delivery}</span>
                                                    <span className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" /> {offer.rating}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-black text-slate-900">₹{offer.price}</div>
                                                <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-1 justify-end mt-1 group-hover/btn:translate-x-1 transition-transform">
                                                    Buy <ArrowRight size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Optimum Cart Teaser (Future Feature) */}
            <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10"><ShoppingCart size={120} /></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                            <h4 className="text-xs font-black uppercase tracking-[0.3em]">Coming in 2026</h4>
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">Optimum Cart Implementation</h2>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                            Our AI will automatically split your grocery list across retailers to ensure you pay the absolute lowest total, including delivery fees.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/30 transition-colors">
                        Join Beta
                    </button>
                </div>
            </div>
        </div>
    );
};
