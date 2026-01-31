"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface StatCardProps {
    title: string;
    value: number;
    suffix?: string;
    prefix?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "indigo" | "pink" | "teal" | "purple";
}

export function StatCard({
    title,
    value,
    suffix = "",
    prefix = "",
    icon: Icon,
    trend,
    color = "indigo",
}: StatCardProps) {
    const colorClasses = {
        indigo: "from-indigo-500 to-purple-500",
        pink: "from-pink-500 to-rose-500",
        teal: "from-teal-500 to-cyan-500",
        purple: "from-purple-500 to-fuchsia-500",
    };

    return (
        <GlassmorphicCard glowColor={color} className="group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 mb-1">{title}</p>
                    <motion.div
                        className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                        style={{
                            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={`bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
                            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
                        </div>
                    </motion.div>

                    {trend && (
                        <motion.div
                            className={`flex items-center mt-2 text-sm ${trend.isPositive ? "text-green-400" : "text-red-400"
                                }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.span
                                animate={{ rotate: trend.isPositive ? 0 : 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                ↑
                            </motion.span>
                            <span className="ml-1">{trend.value}% this week</span>
                        </motion.div>
                    )}
                </div>

                <motion.div
                    className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Icon className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            {/* Hidden sparkline that appears on hover */}
            <motion.div
                className="mt-4 h-16 opacity-0 group-hover:opacity-100"
                initial={{ height: 0 }}
                whileHover={{ height: 64 }}
                transition={{ duration: 0.3 }}
            >
                {/* Add your sparkline chart here using Recharts */}
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-lg" />
            </motion.div>
        </GlassmorphicCard>
    );
}
