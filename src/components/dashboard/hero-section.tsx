"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Star, Shield } from "lucide-react";

export function HeroSection() {
    const { data: session } = useSession();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="relative w-full h-[300px] rounded-3xl overflow-hidden mb-8 group perspective-1000">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 mesh-gradient opacity-90 transition-opacity duration-700 group-hover:opacity-100"></div>

            {/* Floating Orbs (Static for perf, could be animated) */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-[60px] opacity-60 animate-blob"></div>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-screen filter blur-[60px] opacity-60 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-8 md:p-12">

                {/* Left Content */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center md:items-start text-center md:text-left space-y-4"
                >
                    <motion.div variants={item} className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-md px-3 py-1">
                            <Sparkles className="w-3 h-3 mr-1 text-yellow-300" />
                            HostelHub Premium
                        </Badge>
                    </motion.div>

                    <motion.div variants={item} className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-md">
                        <span className="block">Welcome back,</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                            {session?.user?.name || "Student"}
                        </span>
                    </motion.div>

                    <motion.div variants={item} className="max-w-md text-white/80 text-lg">
                        Your hostel dashboard is ready. There are <span className="font-bold text-white">2 active issues</span> requiring your attention today.
                    </motion.div>
                </motion.div>

                {/* Right Content - 3D Floating Avatar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative hidden md:block"
                >
                    <div className="relative w-40 h-40">
                        {/* Spinning Ring */}
                        <div className="absolute inset-[-10px] rounded-full border-2 border-white/20 border-t-white/80 animate-spin-slow"></div>
                        <div className="absolute inset-[-20px] rounded-full border border-white/10 border-b-white/50 animate-reverse-spin"></div>

                        <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={session?.user?.image || ""} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                    {session?.user?.name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Floating Badges */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 -right-4 bg-yellow-400 p-2 rounded-full shadow-lg border-2 border-white"
                        >
                            <Trophy className="w-6 h-6 text-yellow-900" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-2 -left-4 bg-indigo-500 p-2 rounded-full shadow-lg border-2 border-white"
                        >
                            <Shield className="w-5 h-5 text-white" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
