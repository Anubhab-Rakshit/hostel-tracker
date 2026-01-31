"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STORIES = [
    { id: 1, user: "Hostel Admin", image: "", isSeen: false, time: "2m" },
    { id: 2, user: "Sports Comm", image: "", isSeen: false, time: "1h" },
    { id: 3, user: "Mess Comm", image: "", isSeen: true, time: "3h" },
    { id: 4, user: "Warden", image: "", isSeen: true, time: "5h" },
    { id: 5, user: "Events", image: "", isSeen: true, time: "1d" },
];

export function StoryFeed() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-700 group-hover:border-indigo-500 transition-colors"></div>
                    <div className="absolute inset-1 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                    </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Add Story</span>
            </div>

            {STORIES.map((story, i) => (
                <motion.div
                    key={story.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group"
                >
                    <div className={cn(
                        "relative w-16 h-16 p-[2px] rounded-full",
                        story.isSeen
                            ? "bg-zinc-700"
                            : "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 animate-spin-slow"
                    )}>
                        <div className="w-full h-full rounded-full border-2 border-black bg-black p-[2px] transition-transform group-hover:scale-95">
                            <Avatar className="w-full h-full rounded-full">
                                <AvatarImage src={story.image} className="object-cover" />
                                <AvatarFallback className="bg-zinc-800 text-[10px]">{story.user[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium truncate max-w-[70px] text-center">
                        {story.user}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
