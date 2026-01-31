"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
    const idRef = useRef(0);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Add to trail
            setTrail((prev) => [
                ...prev.slice(-10),
                { x: e.clientX, y: e.clientY, id: idRef.current++ },
            ]);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            setIsHovering(
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.closest("button") !== null ||
                target.closest("a") !== null
            );
        };

        window.addEventListener("mousemove", updatePosition);
        window.addEventListener("mouseover", handleMouseOver);

        // Hide default cursor
        document.body.style.cursor = "none";

        return () => {
            window.removeEventListener("mousemove", updatePosition);
            window.removeEventListener("mouseover", handleMouseOver);
            document.body.style.cursor = "auto";
        };
    }, []);

    return (
        <>
            {/* Trail */}
            {trail.map((point, index) => (
                <motion.div
                    key={point.id}
                    className="fixed pointer-events-none z-50 rounded-full bg-indigo-500"
                    style={{
                        left: point.x - 2,
                        top: point.y - 2,
                        width: 4,
                        height: 4,
                    }}
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.02 }}
                />
            ))}

            {/* Main cursor */}
            <motion.div
                className="fixed pointer-events-none z-50 rounded-full bg-indigo-500 mix-blend-difference"
                style={{
                    left: position.x - 6,
                    top: position.y - 6,
                }}
                animate={{
                    width: isHovering ? 40 : 12,
                    height: isHovering ? 40 : 12,
                    left: position.x - (isHovering ? 20 : 6),
                    top: position.y - (isHovering ? 20 : 6),
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
            />
        </>
    );
}
