"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface IsometricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    color?: string; // e.g., "blue", "purple", "green"
    className?: string;
    delay?: number;
}

export const IsometricCard = ({
    title,
    value,
    icon,
    trend,
    color = "blue",
    className,
    delay = 0,
}: IsometricCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Color mappings
    const colorMap: Record<string, string> = {
        blue: "from-blue-500 to-cyan-500 shadow-blue-500/50",
        purple: "from-purple-500 to-pink-500 shadow-purple-500/50",
        green: "from-emerald-500 to-teal-500 shadow-emerald-500/50",
        orange: "from-orange-500 to-red-500 shadow-orange-500/50",
    };

    const bgGradient = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, type: "spring", stiffness: 100 }}
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative h-full w-full rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md transition-shadow duration-500",
                className
            )}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="absolute inset-4 flex flex-col justify-between"
            >
                <div className="flex justify-between items-start">
                    <div className="bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-white/70">{title}</h3>
                    </div>
                    <div
                        className={cn(
                            "p-3 rounded-full bg-gradient-to-br shadow-lg flex items-center justify-center",
                            bgGradient
                        )}
                    >
                        <div className="text-white drop-shadow-md">
                            {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-4xl font-bold text-white tracking-tight drop-shadow-xl">{value}</div>
                    {trend && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full backdrop-blur-sm border",
                                    trend.isPositive
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : "bg-red-500/20 text-red-300 border-red-500/30"
                                )}
                            >
                                {trend.isPositive ? "+" : ""}
                                {trend.value}%
                            </span>
                            <span className="text-white/40">vs last week</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Glow Effect Layer */}
            <div
                className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl",
                    bgGradient
                )}
            />
        </motion.div>
    );
};
