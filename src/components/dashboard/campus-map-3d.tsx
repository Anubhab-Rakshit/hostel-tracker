"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Navigation, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CampusMap3D() {
    const [activeZone, setActiveZone] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-rotate effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (!activeZone) {
                setRotation(prev => (prev + 0.5) % 360);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [activeZone]);

    const zones = [
        { id: "A", name: "Alpha Block", x: 30, y: 30, h: 40, color: "bg-cyan-500" },
        { id: "B", name: "Beta Tech", x: 60, y: 20, h: 60, color: "bg-indigo-500" },
        { id: "C", name: "Gamma Hall", x: 40, y: 60, h: 30, color: "bg-purple-500" },
        { id: "D", name: "Delta Hub", x: 70, y: 70, h: 50, color: "bg-pink-500" },
    ];

    const handleZoneClick = (zoneId: string) => {
        setActiveZone(zoneId === activeZone ? null : zoneId);
    };

    return (
        <div className="relative w-full h-full min-h-[400px] bg-black rounded-3xl overflow-hidden border border-white/10 group">
            {/* Cyberpunk Grid Floor */}
            <div
                className="absolute inset-[-50%] w-[200%] h-[200%] bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_rotateZ(var(--deg))] transition-transform duration-1000 ease-linear"
                style={{ "--deg": `${rotation}deg` } as React.CSSProperties}
            />

            {/* Vignette & Scanlines */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,black_50%)] bg-[size:4px_4px] z-10" />

            {/* Floating Building Holograms */}
            <div className="absolute inset-0 flex items-center justify-center [transform:perspective(1000px)_rotateX(20deg)]">
                <div className="relative w-64 h-64 [transform-style:preserve-3d] transition-transform duration-1000" style={{ transform: `rotateY(${-rotation}deg)` }}>
                    {zones.map((zone) => (
                        <motion.div
                            key={zone.id}
                            onClick={() => handleZoneClick(zone.id)}
                            className={`absolute cursor-pointer group/building`}
                            style={{
                                left: `${zone.x}%`,
                                top: `${zone.y}%`,
                                transform: `translateZ(0px)`,
                            }}
                            whileHover={{ scale: 1.1, transform: "translateZ(20px)" }}
                        >
                            {/* Base */}
                            <div className={`w-8 h-8 rounded-sm rotate-45 border-2 border-white/50 ${zone.color} shadow-[0_0_20px_currentColor] opacity-60 group-hover/building:opacity-100 transition-all`} />

                            {/* Pillar/Hologram */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-t from-white to-transparent h-16 opacity-30" />

                            {/* Label */}
                            <div className="absolute bottom-[140%] left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-black/80 border border-white/20 text-[10px] text-white rounded backdrop-blur opacity-0 group-hover/building:opacity-100 transition-opacity">
                                {zone.name}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* HUD Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                    <div className="flex gap-2 items-center">
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur">
                            <Layers className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white tracking-widest">MAP_SYS_V4</div>
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ONLINE
                            </div>
                        </div>
                    </div>
                    <div className="pointer-events-auto">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/10 bg-black/50 backdrop-blur hover:bg-white/10">
                            <Navigation className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                </div>

                {/* Selected Zone Detail */}
                {activeZone && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-6 right-6 left-6 bg-black/80 border-t border-white/20 backdrop-blur-md p-4 rounded-b-2xl pointer-events-auto"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-bold">{zones.find(z => z.id === activeZone)?.name}</h4>
                                <p className="text-xs text-white/50">3 Active Reports</p>
                            </div>
                            <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                Inspect Zone <Zap className="w-3 h-3 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Search Input (Functional-ish) */}
                <div className="absolute bottom-6 left-6 pointer-events-auto">
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within/search:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Locate Zone..."
                            className="pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-cyan-500/50 w-40 focus:w-60 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
