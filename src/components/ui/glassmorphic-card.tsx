"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface GlassmorphicCardProps {
    children: ReactNode;
    className?: string;
    tiltEnabled?: boolean;
    glowColor?: string;
}

export function GlassmorphicCard({
    children,
    className = "",
    tiltEnabled = true,
    glowColor = "indigo",
}: GlassmorphicCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || !tiltEnabled) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const glowColors: Record<string, string> = {
        indigo: "rgba(99, 102, 241, 0.3)",
        pink: "rgba(236, 72, 153, 0.3)",
        teal: "rgba(20, 184, 166, 0.3)",
        purple: "rgba(168, 85, 247, 0.3)",
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: tiltEnabled ? rotateX : 0,
                rotateY: tiltEnabled ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-xl
        border border-white/20
        shadow-xl
        ${className}
      `}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                    background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${glowColors[glowColor] || glowColors.indigo}, transparent 50%)`,
                }}
            />

            {/* Gradient border animation */}
            <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                style={{
                    background: "linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.5), transparent)",
                }}
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Content */}
            <div className="relative z-10 p-6">{children}</div>
        </motion.div>
    );
}
