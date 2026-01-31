"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MasonryGridProps {
    children: React.ReactNode;
    className?: string;
    // Breakpoints: key is grid width in px, value is number of columns
    breakpointCols?: Record<string | number, number>;
}

export function MasonryGrid({
    children,
    className,
    breakpointCols = {
        default: 3,
        1100: 2,
        700: 1
    }
}: MasonryGridProps) {
    const [columns, setColumns] = useState(3);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            let matched = 3; // Default

            if (typeof breakpointCols === 'number') {
                matched = breakpointCols;
            } else {
                // Find matching breakpoint (descending check)
                // We default to the 'default' key if provided
                if ('default' in breakpointCols) {
                    matched = breakpointCols.default;
                }

                const breakpoints = Object.keys(breakpointCols)
                    .filter(k => k !== 'default')
                    .map(Number)
                    .sort((a, b) => b - a);

                for (const bp of breakpoints) {
                    if (width <= bp) {
                        matched = breakpointCols[bp];
                    }
                }
            }

            setColumns(matched);
        };

        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, [breakpointCols]);

    // Distribute children into columns
    const getColumns = () => {
        const cols: React.ReactNode[][] = Array.from({ length: columns }, () => []);

        React.Children.forEach(children, (child, index) => {
            if (child) {
                cols[index % columns].push(child);
            }
        });

        return cols;
    };

    return (
        <div className={cn("flex gap-6", className)}>
            {getColumns().map((col, i) => (
                <div key={i} className="flex flex-col gap-6 flex-1">
                    {col}
                </div>
            ))}
        </div>
    );
}
