"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  ArrowUp,
  MapPin,
  MoreHorizontal,
  Share2,
  Bookmark,
  Flag,
  Calendar,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, STATUS_LABELS } from "@/lib/utils";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";

interface IssueCardProps {
  issue: {
    _id: string;
    issueNumber: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    hostel: string;
    block: string;
    floor: string;
    room: string;
    isPublic: boolean;
    images: string[];
    upvotes: number;
    comments: number;
    views: number;
    createdAt: string | Date;
    reporter: {
      name: string;
      avatar?: string;
      role?: string;
      isVerified?: boolean;
    };
    assignedTo?: {
      name: string;
      avatar?: string;
    };
    isUpvoted?: boolean;
    isBookmarked?: boolean;
  };
  variant?: "default" | "compact" | "kanban";
  onUpvote?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

export function IssueCard({ issue, variant = "default", onUpvote, onBookmark }: IssueCardProps) {
  const category = ISSUE_CATEGORIES.find((c) => c.id === issue.category);
  const status = STATUS_LABELS.find((s) => s.id === issue.status);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Kanban Variant (Compact Drag Card)
  if (variant === "kanban") {
    return (
      <motion.div
        layoutId={issue._id}
        whileHover={{ scale: 1.03, rotate: -1 }}
        whileTap={{ scale: 0.95 }}
        className="group relative bg-zinc-900 border border-white/10 p-3 rounded-xl cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
      >
        <div className="absolute top-2 right-2 flex gap-1">
          <div className={cn("w-2 h-2 rounded-full",
            issue.priority === 'high' ? 'bg-red-500' :
              issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          )} />
        </div>

        <div className="text-[10px] text-zinc-500 mb-1 font-mono">#{issue.issueNumber}</div>
        <h4 className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-tight mb-2">{issue.title}</h4>

        <div className="flex items-center justify-between mt-2">
          <Avatar className="w-5 h-5 border border-white/10">
            <AvatarImage src={issue.reporter.avatar} />
            <AvatarFallback className="text-[8px]">{issue.reporter.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {issue.comments}</span>
            <span className="flex items-center gap-0.5"><ArrowUp className="w-3 h-3" /> {issue.upvotes}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default / Pinterest Variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseMove={onMouseMove}
      className="group relative rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors overflow-hidden"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(99, 102, 241, 0.15),
                transparent 80%
              )
            `,
        }}
      />

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <Badge variant="outline" className={cn(
              "bg-opacity-10 border- opacity-80 backdrop-blur-sm",
              issue.status === 'resolved' ? 'bg-green-500 text-green-400 border-green-500/30' : 'bg-indigo-500 text-indigo-400 border-indigo-500/30'
            )}>
              {status?.name}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-zinc-400">
              {category?.name}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBookmark?.(issue._id)}>
                <Bookmark className={cn("mr-2 h-4 w-4", issue.isBookmarked && "fill-current text-indigo-400")} />
                {issue.isBookmarked ? "Unbookmark" : "Bookmark"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 focus:text-red-400">
                <Flag className="mr-2 h-4 w-4" /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title & Desc */}
        <Link href={`/issues/${issue._id}`} className="block group-hover:translate-x-1 transition-transform duration-300">
          <h3 className="text-xl font-bold text-white mb-2 leading-snug">
            {issue.title}
          </h3>
          <p className="text-sm text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
            {issue.description}
          </p>
        </Link>

        {/* Image Preview (Layered) */}
        {issue.images.length > 0 && (
          <div className="relative h-40 mb-4 rounded-xl overflow-hidden group/image">
            <img src={issue.images[0]} alt="Issue" className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110" />
            {issue.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white font-medium border border-white/10">
                +{issue.images.length - 1} more
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 ring-2 ring-black">
              <AvatarImage src={issue.reporter.avatar} />
              <AvatarFallback className="bg-indigo-600 text-xs">{issue.reporter.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">{issue.reporter.name}</span>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 text-zinc-400 hover:text-white hover:bg-white/5", issue.isUpvoted && "text-indigo-400 bg-indigo-500/10")}
              onClick={() => onUpvote?.(issue._id)}
            >
              <ArrowUp className={cn("w-4 h-4 mr-1", issue.isUpvoted && "fill-current")} />
              {issue.upvotes}
            </Button>

            <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-400 hover:text-white hover:bg-white/5">
              <MessageSquare className="w-4 h-4 mr-1" />
              {issue.comments}
            </Button>
          </div>
        </div>

        {/* Location Badge */}
        <div className="absolute top-4 right-14 bg-zinc-800/80 backdrop-blur text-[10px] text-zinc-300 px-2 py-1 rounded-full border border-white/5 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-indigo-400" />
          {issue.block}-{issue.room}
        </div>

      </div>
    </motion.div>
  );
}

