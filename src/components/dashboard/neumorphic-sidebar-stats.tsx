"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, AlertCircle, Loader2 } from "lucide-react";

interface StatsData {
    totalIssues: number;
    activeStudents: number;
}

export function NeumorphicSidebarStats() {
    const [stats, setStats] = useState<StatsData>({ totalIssues: 0, activeStudents: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        totalIssues: data.stats.totalIssues || 0,
                        activeStudents: data.stats.activeStudents || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch sidebar stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="mt-auto px-4 py-6 space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2">Quick Stats</h4>

            <div className="grid grid-cols-1 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="neumorphic rounded-xl p-4 flex items-center justify-between border border-white/5 bg-white/5"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400">Total Issues</span>
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white/50 mt-1" />
                        ) : (
                            <span className="text-lg font-bold text-white">{stats.totalIssues.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shadow-inner">
                        <AlertCircle className="w-4 h-4 text-indigo-400" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="neumorphic rounded-xl p-4 flex items-center justify-between border border-white/5 bg-white/5"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400">Active Students</span>
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white/50 mt-1" />
                        ) : (
                            <span className="text-lg font-bold text-white">{stats.activeStudents.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shadow-inner">
                        <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
