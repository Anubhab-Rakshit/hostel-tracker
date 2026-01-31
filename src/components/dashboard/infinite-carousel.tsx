"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PROFILES = [
    { id: 1, name: "Arjun K.", role: "Secretary", image: "" },
    { id: 2, name: "Priya M.", role: "Warden", image: "" },
    { id: 3, name: "Deepak S.", role: "Electrician", image: "" },
    { id: 4, name: "Riya J.", role: "Events", image: "" },
    { id: 5, name: "Manish T.", role: "Plumber", image: "" },
    { id: 6, name: "Ananya B.", role: "Mess Head", image: "" },
];

export function InfiniteCarousel() {
    return (
        <div className="w-full py-10 overflow-hidden relative">
            <h3 className="text-xl font-bold text-white mb-6 px-4">Campus Profiles</h3>

            {/* Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <motion.div
                className="flex gap-6 w-max px-4"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            >
                {[...PROFILES, ...PROFILES, ...PROFILES].map((profile, i) => (
                    <div
                        key={i}
                        className="w-48 h-64 flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 group hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    >
                        <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500 group-hover:rotate-12 transition-transform duration-500">
                            <Avatar className="w-full h-full border-2 border-black">
                                <AvatarImage src={profile.image} />
                                <AvatarFallback>{profile.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="text-center">
                            <h4 className="text-white font-bold">{profile.name}</h4>
                            <p className="text-sm text-indigo-400">{profile.role}</p>
                        </div>

                        <button className="px-4 py-1.5 rounded-full bg-white/10 text-xs text-white hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            View Profile
                        </button>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
