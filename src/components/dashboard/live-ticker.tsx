"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, Activity, Info, Megaphone } from "lucide-react";

export function LiveTicker() {
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch("/api/announcements?limit=10&isPublished=true");
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data.announcements || []);
                }
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            }
        };

        fetchAnnouncements();
        // Poll every minute
        const interval = setInterval(fetchAnnouncements, 60000);
        return () => clearInterval(interval);
    }, []);

    if (announcements.length === 0) return null;

    return (
        <div className="w-full h-14 bg-white/5 border-y border-white/10 backdrop-blur-md overflow-hidden flex items-center mb-0 relative">
            {/* Label */}
            <div className="absolute left-0 top-0 bottom-0 z-20 px-4 bg-indigo-600 flex items-center gap-2 shadow-lg">
                <Megaphone className="w-4 h-4 text-white animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Updates</span>
            </div>

            {/* Gradient Fade */}
            <div className="absolute left-[85px] top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            {/* Scrolling Content */}
            <div className="flex items-center gap-8 animate-marquee whitespace-nowrap pl-32">
                {[...announcements, ...announcements].map((item, i) => (
                    <div key={`${item._id}-${i}`} className="flex items-center gap-3 group cursor-pointer">
                        <div className="flex items-center gap-2 text-sm">
                            {item.type === "emergency" ? (
                                <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                            ) : item.type === "warning" ? (
                                <Activity className="w-4 h-4 text-orange-500" />
                            ) : (
                                <Info className="w-4 h-4 text-blue-400" />
                            )}
                            <span className={`font-semibold ${item.type === "emergency" ? "text-red-400" :
                                    item.type === "warning" ? "text-orange-400" : "text-blue-300"
                                }`}>
                                {item.title}:
                            </span>
                            <span className="text-gray-300">{item.content}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20 mx-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
