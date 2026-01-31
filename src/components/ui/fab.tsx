"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

interface FabAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
}

interface FabProps {
    actions: FabAction[];
}

export function Fab({ actions }: FabProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Action buttons */}
            {isOpen && (
                <motion.div
                    className="absolute bottom-16 right-0 flex flex-col gap-3"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                >
                    {actions.map((action, index) => (
                        <motion.button
                            key={index}
                            onClick={action.onClick}
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-lg px-4 py-3 rounded-full hover:bg-white/20 transition-colors"
                            initial={{ opacity: 0, x: 50, rotate: -90 }}
                            animate={{ opacity: 1, x: 0, rotate: 0 }}
                            exit={{ opacity: 0, x: 50, rotate: -90 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, x: -5 }}
                        >
                            <span className="text-white text-sm font-medium">{action.label}</span>
                            <div className="text-white">{action.icon}</div>
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Main FAB button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <Plus className="w-8 h-8 text-white" />
            </motion.button>
        </div>
    );
}
