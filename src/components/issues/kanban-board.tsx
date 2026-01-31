"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { IssueCard } from "./issue-card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface KanbanBoardProps {
    issues: any[];
}

const COLUMNS = [
    { id: "reported", label: "Reported", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
    { id: "assigned", label: "In Progress", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
    { id: "resolved", label: "Resolved", color: "bg-green-500/10 border-green-500/20 text-green-400" },
];

export function KanbanBoard({ issues }: KanbanBoardProps) {
    // Group issues by status
    const [boardData, setBoardData] = useState(() => {
        const grouped: Record<string, any[]> = { reported: [], assigned: [], resolved: [] };
        issues.forEach((issue) => {
            const status = issue.status === 'in_progress' ? 'assigned' : issue.status;
            if (grouped[status]) grouped[status].push(issue);
            else grouped.reported.push(issue); // Fallback
        });
        return grouped;
    });

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
            {COLUMNS.map((column) => (
                <div key={column.id} className="min-w-[300px] w-full bg-white/5 rounded-xl border border-white/10 flex flex-col">
                    {/* Column Header */}
                    <div className={cn("p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-inherit backdrop-blur-xl z-10 rounded-t-xl")}>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", column.color.split(" ")[0].replace("/10", ""))} />
                            <h3 className="font-bold text-white tracking-wide">{column.label}</h3>
                        </div>
                        <Badge variant="outline" className="border-white/10">{boardData[column.id]?.length || 0}</Badge>
                    </div>

                    {/* Cards Container */}
                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {boardData[column.id]?.map((issue) => (
                            <IssueCard key={issue._id} issue={issue} variant="kanban" />
                        ))}
                        {boardData[column.id]?.length === 0 && (
                            <div className="h-24 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-zinc-600 text-sm">
                                Empty
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
