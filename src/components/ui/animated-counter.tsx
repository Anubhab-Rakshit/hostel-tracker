"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
}

export function AnimatedCounter({
    value,
    duration = 2000,
    suffix = "",
    prefix = "",
    decimals = 0,
}: AnimatedCounterProps) {
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const display = useTransform(spring, (current) => {
        const num = current.toFixed(decimals);
        return `${prefix}${num}${suffix}`;
    });

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
}
