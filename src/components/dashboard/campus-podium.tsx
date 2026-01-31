"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const LEADERS = [
    { id: 2, name: "Rahul K.", points: 850, rank: 2, avatar: "", color: "bg-gray-300" },
    { id: 1, name: "Sneha G.", points: 1200, rank: 1, avatar: "", color: "bg-yellow-400" },
    { id: 3, name: "Amit S.", points: 720, rank: 3, avatar: "", color: "bg-orange-400" },
];

export function CampusPodium() {
    return (
        <div className="h-full w-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Campus Leaders
            </h3>

            <div className="flex-1 flex items-end justify-center gap-4 py-4 px-2">
                {LEADERS.map((leader) => (
                    <motion.div
                        key={leader.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ delay: 0.2 * leader.rank, duration: 0.6, type: "spring" }}
                        className="flex flex-col items-center group relative"
                    >
                        {/* Crown for #1 */}
                        {leader.rank === 1 && (
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-20 text-yellow-400"
                            >
                                <Crown className="w-8 h-8 fill-yellow-400/20" />
                            </motion.div>
                        )}

                        {/* Avatar */}
                        <div className={cn(
                            "mb-3 relative transition-transform duration-300 group-hover:scale-110",
                            leader.rank === 1 ? "w-16 h-16" : "w-12 h-12"
                        )}>
                            <div className={cn(
                                "absolute inset-0 rounded-full blur-md opacity-60",
                                leader.rank === 1 ? "bg-yellow-500" : leader.rank === 2 ? "bg-gray-400" : "bg-orange-500"
                            )} />
                            <Avatar className="w-full h-full border-2 border-white relative z-10">
                                <AvatarImage src={leader.avatar} />
                                <AvatarFallback>{leader.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-1 z-20 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/20">
                                #{leader.rank}
                            </div>
                        </div>

                        {/* Podium Bar */}
                        <div
                            className={cn(
                                "w-20 rounded-t-lg backdrop-blur-md border-t border-x border-white/20 flex flex-col items-center justify-end pb-4 shadow-xl",
                                leader.rank === 1 ? "h-40 bg-gradient-to-b from-yellow-500/30 to-yellow-900/10" :
                                    leader.rank === 2 ? "h-32 bg-gradient-to-b from-gray-400/30 to-gray-900/10" :
                                        "h-24 bg-gradient-to-b from-orange-500/30 to-orange-900/10"
                            )}
                        >
                            <span className="text-xs font-bold text-white mb-1">{leader.name.split(" ")[0]}</span>
                            <span className="text-[10px] text-white/60">{leader.points} pts</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
