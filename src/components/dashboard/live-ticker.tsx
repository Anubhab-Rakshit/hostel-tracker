"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity } from "lucide-react";

const DUMMY_ACTIVITIES = [
    { id: 1, user: "Alex M.", action: "reported", issue: "Broken WiFi", time: "2m ago", avatar: "" },
    { id: 2, user: "Sarah J.", action: "upvoted", issue: "Water Cooler", time: "5m ago", avatar: "" },
    { id: 3, user: "Admin", action: "resolved", issue: "AC Repair", time: "12m ago", avatar: "" },
    { id: 4, user: "Mike T.", action: "commented", issue: "Gym Equipment", time: "15m ago", avatar: "" },
    { activity: "Maintenance Team is active in Block B" },
];

export function LiveTicker() {
    return (
        <div className="w-full h-14 bg-white/5 border-y border-white/10 backdrop-blur-md overflow-hidden flex items-center mb-8 relative">
            {/* Label */}
            <div className="absolute left-0 top-0 bottom-0 z-20 px-4 bg-indigo-600 flex items-center gap-2 shadow-lg">
                <Activity className="w-4 h-4 text-white animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live</span>
            </div>

            {/* Gradient Fade */}
            <div className="absolute left-[70px] top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>

            {/* Scrolling Content */}
            <div className="flex items-center gap-8 animate-marquee whitespace-nowrap pl-24">
                {[...DUMMY_ACTIVITIES, ...DUMMY_ACTIVITIES].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group cursor-pointer">
                        {"user" in item ? (
                            <>
                                <Avatar className="h-6 w-6 border border-white/20">
                                    <AvatarImage src={item.avatar} />
                                    <AvatarFallback className="text-[10px]">{item.user[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-300">
                                    <span className="font-semibold text-white">{item.user}</span> {item.action} <span className="text-indigo-400">{item.issue}</span>
                                </span>
                                <span className="text-xs text-gray-500 border border-white/10 px-1.5 rounded">{item.time}</span>
                            </>
                        ) : (
                            <span className="flex items-center gap-2 text-sm text-indigo-300 font-medium">
                                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                {item.activity}
                            </span>
                        )}
                        <div className="w-1 h-1 rounded-full bg-white/20 mx-2"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
