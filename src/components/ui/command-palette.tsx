"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Command, File, User, TrendingUp, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const RECENT_SEARCHES = [
        { id: 1, label: "WiFi issues in Block A", icon: <WifiIcon /> },
        { id: 2, label: "Water Cooler repair", icon: <DropletIcon /> },
    ];

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className="w-full relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 p-4 text-left shadow-lg transition-all hover:bg-white/10 hover:shadow-indigo-500/10"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-indigo-400" />
                        <span className="text-muted-foreground group-hover:text-white transition-colors">Search issues, students, or rooms...</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>

                {/* Animated Gradient Border */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </button>

            <AnimatePresence>
                {open && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="p-0 overflow-hidden bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl max-w-2xl">
                            <div className="flex items-center border-b border-white/10 p-4">
                                <Search className="mr-2 h-5 w-5 shrink-0 text-indigo-500" />
                                <input
                                    placeholder="Type a command or search..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex h-11 w-full rounded-none bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                />
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                                {!query && (
                                    <div className="p-2">
                                        <h3 className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Recent</h3>
                                        {RECENT_SEARCHES.map((item) => (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                                                onClick={() => { setOpen(false); setQuery(item.label); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors"
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </motion.button>
                                        ))}

                                        <div className="h-px bg-white/5 my-2 mx-2" />

                                        <h3 className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Quick Actions</h3>
                                        <QuickAction icon={<File />} label="New Report" shortcut="N" onClick={() => router.push('/issues/new')} />
                                        <QuickAction icon={<TrendingUp />} label="View Analytics" shortcut="A" onClick={() => router.push('/management/analytics')} />
                                        <QuickAction icon={<User />} label="My Profile" shortcut="P" onClick={() => router.push('/profile')} />
                                    </div>
                                )}

                                {query && (
                                    <div className="p-8 text-center text-gray-500">
                                        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Searching for &quot;<span className="text-white">{query}</span>&quot;...</p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
}

function QuickAction({ icon, label, shortcut, onClick }: any) {
    return (
        <motion.button
            whileHover={{ scale: 0.99, backgroundColor: "rgba(255,255,255,0.05)" }}
            onClick={onClick}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-indigo-500/20 text-gray-400 group-hover:text-indigo-400 transition-colors">
                    {React.cloneElement(icon, { size: 14 })}
                </div>
                <span>{label}</span>
            </div>
            {shortcut && (
                <span className="text-[10px] text-gray-600 border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
                    {shortcut}
                </span>
            )}
        </motion.button>
    );
}

function WifiIcon() { return <Zap className="w-4 h-4 text-yellow-500" />; }
function DropletIcon() { return <Zap className="w-4 h-4 text-blue-500" />; }
