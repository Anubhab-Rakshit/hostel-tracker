"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Zap } from "lucide-react";

const data = [
    { name: "Active", value: 75 },
    { name: "Remaining", value: 25 },
];
const COLORS = ["#6366f1", "rgba(255,255,255,0.1)"];

export function MomentumChart() {
    return (
        <div className="h-full flex flex-col items-center justify-center relative">
            <h3 className="absolute top-4 left-4 text-lg font-bold text-white flex items-center gap-2">
                Momentum
            </h3>

            <div className="w-full h-[200px] mt-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-white">75%</span>
                        <span className="text-xs text-indigo-300">Resolution Rate</span>
                    </div>
                </div>

                {/* Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                </div>
            </div>

            <div className="text-center px-4 -mt-4 pb-4">
                <p className="text-sm text-gray-400">
                    Great momentum! The community is resolving issues <span className="text-indigo-400 font-bold">2x faster</span> than last week.
                </p>
            </div>
        </div>
    );
}
