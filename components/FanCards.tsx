import React from 'react';
import { motion } from 'framer-motion';

const cards = [
    { src: '/image.png', rotate: -15, z: 1, x: -200, scale: 0.9 },
    { src: '/image1.png', rotate: -7, z: 2, x: -100, scale: 0.95 },
    { src: '/image2.png', rotate: 0, z: 3, x: 0, scale: 1.1 }, // Center
    { src: '/image3.png', rotate: 7, z: 2, x: 100, scale: 0.95 },
    { src: '/image4.png', rotate: 15, z: 1, x: 200, scale: 0.9 },
];

const FanCards = () => {
    return (
        <div className="relative h-[400px] w-full flex justify-center items-center overflow-hidden py-10">
            <div className="relative w-full max-w-4xl h-full flex justify-center items-center">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        className="absolute w-[200px] md:w-[260px] aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden border-4 border-white"
                        initial={{
                            rotate: 0,
                            x: 0,
                            scale: 0.5,
                            opacity: 0
                        }}
                        whileInView={{
                            rotate: card.rotate,
                            x: card.x,
                            scale: card.scale,
                            opacity: 1,
                            zIndex: card.z
                        }}
                        whileHover={{
                            scale: 1.2,
                            zIndex: 10,
                            rotate: 0,
                            transition: { duration: 0.3 }
                        }}
                        transition={{
                            duration: 0.8,
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 100
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src={card.src}
                            alt={`Gallery card ${index}`}
                            className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white font-black uppercase text-xs tracking-widest">View Moment</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FanCards;
