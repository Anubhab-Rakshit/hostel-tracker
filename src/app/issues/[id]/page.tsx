"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  MessageSquare,
  Eye,
  Share2,
  Bookmark,
  Flag,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  Circle,
  CircleDot,
  XCircle,
  Send,
  MoreHorizontal,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Maximize2,
  Download,
  Copy,
  ExternalLink,
  Droplets,
  Zap,
  Sparkles,
  Wifi,
  Armchair,
  Building2,
  Shield,
  Thermometer,
  Bug,
  ChevronRight,
  Flame,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, STATUS_LABELS } from "@/lib/utils";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { ParticleBackground } from "@/components/ui/particle-background";

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-6 w-6" />,
  electrical: <Zap className="h-6 w-6" />,
  cleanliness: <Sparkles className="h-6 w-6" />,
  internet: <Wifi className="h-6 w-6" />,
  furniture: <Armchair className="h-6 w-6" />,
  structural: <Building2 className="h-6 w-6" />,
  security: <Shield className="h-6 w-6" />,
  ac_heating: <Thermometer className="h-6 w-6" />,
  pest_control: <Bug className="h-6 w-6" />,
  other: <MoreHorizontal className="h-6 w-6" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  reported: <Circle className="h-5 w-5" />,
  assigned: <CircleDot className="h-5 w-5" />,
  in_progress: <CircleDot className="h-5 w-5" />,
  resolved: <CheckCircle2 className="h-5 w-5" />,
  rejected: <XCircle className="h-5 w-5" />,
};

const priorityIcons: Record<string, React.ReactNode> = {
  low: <Clock className="h-5 w-5" />,
  medium: <Clock className="h-5 w-5" />,
  high: <Flame className="h-5 w-5" />,
  emergency: <AlertTriangle className="h-5 w-5" />,
};

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const contentY = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    let active = true;

    const fetchIssue = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/issues/${params.id}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to load issue");
        }
        const data = await response.json();
        if (active) {
          setIssue(data);
        }
      } catch (error) {
        if (active) {
          setIssue(null);
          setLoadError(error instanceof Error ? error.message : "Failed to load issue");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchIssue();

    return () => {
      active = false;
    };
  }, [params.id]);

  const category = ISSUE_CATEGORIES.find((c) => c.id === issue?.category);
  const priority = PRIORITY_LEVELS.find((p) => p.id === issue?.priority);
  const status = STATUS_LABELS.find((s) => s.id === issue?.status);

  const handleUpvote = async () => {
    if (!issue) return;
    const previous = issue;
    const nextUpvoted = !issue.isUpvoted;
    const nextCount = (issue.upvotes ?? issue.upvoteCount ?? 0) + (nextUpvoted ? 1 : -1);

    setIssue({
      ...issue,
      isUpvoted: nextUpvoted,
      upvotes: Math.max(nextCount, 0),
      upvoteCount: Math.max(nextCount, 0),
    });

    try {
      const response = await fetch(`/api/issues/${issue._id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to upvote");
      }
    } catch (error) {
      setIssue(previous);
      toast.error("Failed to upvote");
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !issue) return;
    const content = comment.trim();
    setComment("");

    try {
      const response = await fetch(`/api/issues/${issue._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      const data = await response.json();
      const newComment = data?.comment;
      setIssue((prev: any) => {
        if (!prev) return prev;
        const updatedComments = newComment
          ? [...(prev.comments || []), newComment]
          : prev.comments || [];
        return {
          ...prev,
          comments: updatedComments,
          commentCount: updatedComments.length,
        };
      });
      toast.success("Comment posted");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[40vh] w-full" />
        <div className="max-w-5xl mx-auto p-6 space-y-6 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !issue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-2">Issue Not Found</h1>
        <p className="text-muted-foreground mb-4">{loadError || "Could not load issue details"}</p>
        <Button onClick={() => router.push("/issues")}>Return to Issues</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <ParticleBackground particleCount={30} />

      {/* Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-900/40 to-background"
        >
          {issue.images?.[0] ? (
            <img
              src={issue.images[0]}
              alt="Issue Background"
              className="w-full h-full object-cover blur-sm opacity-50"
            />
          ) : (
            <div className="w-full h-full bg-grid-white/[0.05]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </motion.div>

        <div className="absolute inset-0 z-10 container mx-auto px-6 flex flex-col justify-end pb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={cn("px-3 py-1 text-sm bg-white/10 hover:bg-white/20 backdrop-blur border-white/10 text-white shadow-lg")}>
                {statusIcons[issue.status]}
                <span className="ml-2 capitalize">{status?.name}</span>
              </Badge>
              <Badge variant={issue.priority} className="px-3 py-1 text-sm shadow-lg">
                {priorityIcons[issue.priority]}
                <span className="ml-2 capitalize">{issue.priority} Priority</span>
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-black/20 backdrop-blur">
                #{issue.issueNumber || issue._id?.slice(-6).toUpperCase()}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {issue.title}
            </h1>

            <div className="flex items-center gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarImage src={issue.reporter.avatar} />
                  <AvatarFallback>{issue.reporter.name[0]}</AvatarFallback>
                </Avatar>
                <span>{issue.reporter.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{issue.hostel}, Room {issue.room}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y: contentY }}
        className="container mx-auto px-6 -mt-10 relative z-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detailed Info & Comments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bento Grid Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassmorphicCard className="col-span-2 md:col-span-2 p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upvotes</p>
                  <p className="text-3xl font-bold">{issue.upvoteCount ?? issue.upvotes ?? 0}</p>
                </div>
                <Button
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full transition-all",
                    issue.isUpvoted
                      ? "bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                  onClick={handleUpvote}
                >
                  <ArrowUp className={cn("h-6 w-6", issue.isUpvoted ? "text-white" : "text-foreground")} />
                </Button>
              </GlassmorphicCard>

              <GlassmorphicCard className="col-span-1 p-4 flex flex-col items-center justify-center text-center">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mb-2">
                  {categoryIcons[issue.category]}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{issue.category.replace("_", " ")}</p>
              </GlassmorphicCard>

              <GlassmorphicCard className="col-span-1 p-4 flex flex-col items-center justify-center text-center">
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 mb-2">
                  <Eye className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">{issue.viewCount ?? 0} Views</p>
              </GlassmorphicCard>
            </div>

            {/* Description Card */}
            <GlassmorphicCard className="p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" /> Description
              </h3>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {issue.description.split("\n").map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </GlassmorphicCard>

            {/* Image Gallery */}
            {issue.images?.length > 0 && (
              <GlassmorphicCard className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-pink-400" /> Evidence
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.images.map((image: string, index: number) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in shadow-lg border border-white/10"
                        >
                          <img
                            src={image}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl bg-black/90 border-white/10 p-1">
                        <img
                          src={image}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-auto rounded-lg max-h-[85vh] object-contain"
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </GlassmorphicCard>
            )}

            {/* Comments Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                Comments <Badge variant="secondary" className="ml-2">{issue.comments?.length || 0}</Badge>
              </h3>

              <GlassmorphicCard className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <Textarea
                      placeholder="Share your thoughts or updates..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px] bg-white/5 border-white/10 focus:border-indigo-500/50 resize-none rounded-xl"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitComment} disabled={!comment.trim()} className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700">
                        <Send className="mr-2 h-4 w-4" /> Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>

              <div className="space-y-4">
                <AnimatePresence>
                  {(issue.comments || []).map((commentItem: any, index: number) => (
                    <motion.div
                      key={commentItem._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur hover:bg-white/10 transition-colors"
                    >
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={commentItem.user?.avatar || ""} />
                          <AvatarFallback>{commentItem.user?.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold text-white mr-2">{commentItem.user?.name}</span>
                              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(commentItem.createdAt), { addSuffix: true })}</span>
                            </div>
                            {commentItem.user?.role !== "student" && (
                              <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">
                                {commentItem.user?.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300 leading-relaxed">{commentItem.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-bold mb-6">Status Timeline</h3>
              <div className="relative pl-4 space-y-8 border-l-2 border-white/10 ml-2">
                {(issue.statusHistory || []).map((history: any, index: number) => {
                  const isLast = index === (issue.statusHistory?.length || 0) - 1;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="relative"
                    >
                      <div className={cn(
                        "absolute -left-[25px] h-4 w-4 rounded-full border-2 border-background",
                        isLast ? "bg-indigo-500 ring-4 ring-indigo-500/20" : "bg-gray-600"
                      )} />

                      <div className=" bg-white/5 p-3 rounded-lg border border-white/5">
                        <p className="font-semibold text-sm capitalize">{STATUS_LABELS.find(s => s.id === history.status)?.name}</p>
                        <p className="text-xs text-gray-500 mb-1">{format(new Date(history.timestamp), "MMM d, h:mm a")}</p>
                        {history.remarks && (
                          <p className="text-xs text-gray-400 mt-2 bg-black/20 p-2 rounded italic">"{history.remarks}"</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassmorphicCard>

            {/* Assigned Staff */}
            {issue.assignedTo ? (
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold mb-4">Assigned Staff</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-green-500/30">
                    <AvatarImage src={issue.assignedTo.avatar} />
                    <AvatarFallback>{issue.assignedTo.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{issue.assignedTo.name}</p>
                    <p className="text-xs text-muted-foreground">{issue.assignedTo.email}</p>
                    <Badge variant="outline" className="mt-2 text-xs border-green-500/20 text-green-400 bg-green-500/5">
                      Maintenance Staff
                    </Badge>
                  </div>
                </div>
              </GlassmorphicCard>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                <p className="text-sm text-muted-foreground">No staff assigned yet</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl bg-white/5 hover:bg-white/10 border-white/10">
                <Share2 className="mr-3 h-4 w-4" /> Share Issue
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl bg-white/5 hover:bg-white/10 border-white/10">
                <Flag className="mr-3 h-4 w-4" /> Report Problem
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
