"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  Kanban,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { IssueCard } from "./issue-card";
import { KanbanBoard } from "./kanban-board";
import { MasonryGrid } from "@/components/ui/masonry-grid";
import { IssueFilters, FilterState } from "./issue-filters";
import { cn, STATUS_LABELS } from "@/lib/utils";

interface Issue {
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
  createdAt: string;
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
}

interface IssuesListProps {
  issues?: Issue[];
  isLoading?: boolean;
  showFilters?: boolean;
  defaultView?: "grid" | "list" | "kanban";
  showViewToggle?: boolean;
  showSearch?: boolean;
  title?: string;
  emptyMessage?: string;
  queryParams?: Record<string, string | number | boolean | undefined>;
}

const defaultFilters: FilterState = {
  categories: [],
  priorities: [],
  statuses: [],
  hostels: [],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function IssuesList({
  issues: propIssues,
  isLoading: propLoading,
  showFilters = true,
  defaultView = "grid",
  showViewToggle = true,
  showSearch = true,
  title = "All Issues",
  emptyMessage = "No issues found",
  queryParams,
}: IssuesListProps) {
  const [view, setView] = useState<"grid" | "list" | "kanban">(defaultView);
  const [issues, setIssues] = useState<Issue[]>(propIssues || []);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>(issues);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(propLoading || false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Apply filters
  useEffect(() => {
    let result = [...issues];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.issueNumber.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((issue) => filters.categories.includes(issue.category));
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      result = result.filter((issue) => filters.priorities.includes(issue.priority));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((issue) => filters.statuses.includes(issue.status));
    }

    // Hostel filter
    if (filters.hostels.length > 0) {
      result = result.filter((issue) => filters.hostels.includes(issue.hostel));
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "createdAt":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "upvotes":
          comparison = b.upvotes - a.upvotes;
          break;
        case "views":
          comparison = b.views - a.views;
          break;
        case "priority": {
          const priorityOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
          comparison =
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
          break;
        }
        default:
          comparison = 0;
      }
      return filters.sortOrder === "asc" ? -comparison : comparison;
    });

    setFilteredIssues(result);
  }, [issues, filters, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleUpvote = useCallback(async (id: string) => {
    let previous: Issue[] = [];
    setIssues((prev) => {
      previous = prev;
      return prev.map((issue) => {
        if (issue._id !== id) return issue;
        const nextUpvoted = !issue.isUpvoted;
        const nextCount = (issue.upvotes || 0) + (nextUpvoted ? 1 : -1);
        return {
          ...issue,
          isUpvoted: nextUpvoted,
          upvotes: Math.max(nextCount, 0),
        };
      });
    });

    try {
      const response = await fetch(`/api/issues/${id}/upvote`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to upvote");
      }
    } catch {
      setIssues(previous);
    }
  }, []);

  const handleBookmark = useCallback((id: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === id
          ? { ...issue, isBookmarked: !issue.isBookmarked }
          : issue
      )
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchIssues = async () => {
      if (propIssues && propIssues.length > 0 && reloadKey === 0) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        if (filters.categories.length) params.set("category", filters.categories.join(","));
        if (filters.priorities.length) params.set("priority", filters.priorities.join(","));
        if (filters.statuses.length) params.set("status", filters.statuses.join(","));
        if (filters.hostels.length) params.set("hostel", filters.hostels.join(","));
        params.set("sortBy", filters.sortBy);
        params.set("sortOrder", filters.sortOrder);
        if (searchQuery) params.set("search", searchQuery);
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === false) return;
            params.set(key, String(value));
          });
        }
        params.set("limit", "50");

        const response = await fetch(`/api/issues?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch issues");
        }
        const data = await response.json();
        if (isMounted) {
          setIssues(data.issues || []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("Failed to load issues");
          setIssues([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchIssues();
    return () => {
      isMounted = false;
    };
  }, [filters, reloadKey, queryParams]);
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">{title}</h2>
          <p className="text-muted-foreground">
            {filteredIssues.length} issue{filteredIssues.length !== 1 && "s"} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Link href="/issues/new">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform">
              <Plus className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {showSearch && (
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-colors"
            />
          </div>
        )}

        {showViewToggle && (
          <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex items-center">
            {(["grid", "list", "kanban"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-all",
                  view === v ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:text-white"
                )}
              >
                {v === "grid" && <LayoutGrid className="h-4 w-4" />}
                {v === "list" && <List className="h-4 w-4" />}
                {v === "kanban" && <Kanban className="h-4 w-4" />}
                <span className="capitalize hidden md:inline">{v}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <IssueFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(defaultFilters)}
        />
      )}

      {/* Content */}
      {loadError ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center text-red-400"
        >
          <p>{loadError}</p>
          <Button variant="ghost" className="mt-2" onClick={handleRefresh}>Retry</Button>
        </motion.div>
      ) : filteredIssues.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/10 rounded-xl"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{emptyMessage}</h3>
          <p className="text-zinc-500">Try adjusting your filters</p>
        </motion.div>
      ) : (
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {view === "grid" && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MasonryGrid>
                  {filteredIssues.map((issue) => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      onUpvote={handleUpvote}
                      onBookmark={handleBookmark}
                    />
                  ))}
                </MasonryGrid>
              </motion.div>
            )}

            {view === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 max-w-4xl mx-auto"
              >
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    variant="compact"
                    onUpvote={handleUpvote}
                    onBookmark={handleBookmark}
                  />
                ))}
              </motion.div>
            )}

            {view === "kanban" && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <KanbanBoard issues={filteredIssues} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
