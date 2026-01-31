"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Crown,
  Flame,
  Plus,
  Images,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryUploadCard } from "@/components/gallery/gallery-upload-card";
import { cn, formatRelativeTime, STATUS_LABELS } from "@/lib/utils";

interface IssueItem {
  _id: string;
  title: string;
  category: string;
  status: string;
  upvoteCount?: number;
  upvotes?: number;
  createdAt: string;
  reporter?: {
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  type?: string;
  priority?: string;
  createdAt: string;
}

interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption?: string;
  uploadDate: string;
  academicYear?: string;
  uploadedBy?: {
    name?: string;
    avatar?: string;
  };
}

export function CollegeHome() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [galleryPosts, setGalleryPosts] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [issuesRes, annRes, galleryRes] = await Promise.all([
          fetch("/api/issues?limit=6&sortBy=upvotes&sortOrder=desc"),
          fetch("/api/announcements?limit=5"),
          fetch("/api/gallery?limit=4"),
        ]);

        const issuesJson = issuesRes.ok ? await issuesRes.json() : { issues: [] };
        const annJson = annRes.ok ? await annRes.json() : { announcements: [] };
        const galleryJson = galleryRes.ok ? await galleryRes.json() : { posts: [] };

        if (!active) return;
        setIssues(issuesJson.issues || []);
        setAnnouncements(annJson.announcements || []);
        setGalleryPosts(galleryJson.posts || []);
      } catch {
        if (!active) return;
        setIssues([]);
        setAnnouncements([]);
        setGalleryPosts([]);
      } finally {
        if (active) setIsLoading(false);
        if (active) setIsGalleryLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const collegeName = session?.user?.college || "Your College";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Campus Resident";
  const userRole = session?.user?.role || "student";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CR";

  const roleLabel =
    userRole === "management"
      ? "Management"
      : userRole === "maintenance"
        ? "Maintenance"
        : "Student";

  const leaders = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    issues.forEach((issue) => {
      const reporter = issue.reporter;
      if (!reporter?._id) return;
      const existing = map.get(reporter._id) || {
        id: reporter._id,
        name: reporter.name || "Community member",
        count: 0,
      };
      existing.count += 1;
      map.set(reporter._id, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [issues]);

  const stats = useMemo(() => {
    const open = issues.filter((i) => i.status !== "resolved").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    const totalUpvotes = issues.reduce((sum, i) => sum + (i.upvoteCount ?? i.upvotes ?? 0), 0);
    return { open, resolved, totalUpvotes };
  }, [issues]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-105">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase">HostelHub</p>
              <p className="text-lg font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">Nexus</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            {[
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Community', path: '/issues' },
              { name: 'Gallery', path: '/gallery' },
              { name: 'Scan', path: '/qr-scanner' }
            ].map((item) => (
              <Link key={item.name} href={item.path}>
                <Button variant="ghost" className="rounded-full px-6 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-white/60 hover:text-white hover:bg-white/10 hover:rotate-12 transition-all">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/issues/new">
              <Button className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl space-y-24">

          {/* Hero Section - Non-traditional Layout */}
          <section className="relative grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-indigo-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Live Campus Network
              </div>

              <div className="space-y-2">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Student</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white/60 to-white/10 italic font-serif pr-4">Voice</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-purple-600">Amplified.</span>
                </h1>
              </div>

              <p className="max-w-md text-lg text-white/50 leading-relaxed">
                Welcome back, <span className="text-white font-medium">{userName.split(' ')[0]}</span>.
                Your digital campus identity controls the flow of information.
                <span className="block mt-2 text-sm text-indigo-400/80">
                  {stats.open} active reports • {stats.resolved} resolved • {stats.totalUpvotes} community signals
                </span>
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.3)] text-base px-8 border-0">
                    Open Dashboard
                  </Button>
                </Link>
                <Link href="/issues">
                  <Button size="lg" variant="outline" className="h-14 rounded-full border-white/10 bg-transparent hover:bg-white/5 text-base px-8 backdrop-blur-md">
                    Join Discussion
                  </Button>
                </Link>
              </div>
            </div>

            {/* Abstract Visual Representation */}
            <div className="relative h-[600px] w-full hidden lg:block perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-3xl transform rotate-3 scale-95 border border-white/5 backdrop-blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-3xl transform -rotate-2 scale-95 border border-white/5 backdrop-blur-sm" />

              {/* Main Card */}
              <div className="absolute inset-4 rounded-2xl bg-black/80 border border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Simulated Interface */}
                <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="font-mono text-xs text-white/30 tracking-widest">SYSTEM_V2.0</div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="col-span-2 rounded-xl bg-white/5 border border-white/5 p-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-50"><TrendingUp className="w-6 h-6 text-green-400" /></div>
                      <div className="text-3xl font-bold text-white mb-1">{stats.totalUpvotes}</div>
                      <div className="text-xs text-white/40 uppercase tracking-widest">Community Impact</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </div>

                    <div className="rounded-xl bg-white/5 border border-white/5 p-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-50"><Flame className="w-6 h-6 text-orange-400" /></div>
                      <div className="text-3xl font-bold text-white mb-1">{stats.open}</div>
                      <div className="text-xs text-white/40 uppercase tracking-widest">Active</div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 border border-indigo-500/30 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                          <Crown className="w-6 h-6 text-white" />
                          <ArrowRight className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Leaderboard</div>
                          <div className="text-indigo-200 text-xs">Top Contributors</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-pink-500/20">
                      {userInitials}
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 w-24 bg-white/10 rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-white/50 w-[70%]" />
                      </div>
                      <div className="text-[10px] text-white/30 font-mono">ID: {session?.user?.id.substring(0, 8) || "UNKNOWN"}</div>
                    </div>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 h-6">
                      ONLINE
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* New Bento Layout for Features */}
          <section className="space-y-12">
            <div className="flex items-end justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Pulse</span></h2>
                <p className="text-white/40">Real-time updates from your hostel network</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-white/20" />
                <div className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">

              {/* Trending Report - Large Block */}
              <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-neutral-900 border border-white/10 p-6 relative overflow-hidden group transition-all hover:border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium tracking-wide text-sm">TRENDING ISSUE</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">Top Alert</Badge>
                  </div>

                  <div className="flex-1 flex flex-col justify-end p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/card">
                    {issues.length > 0 ? (
                      <>
                        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover/card:text-indigo-300 transition-colors">
                          {issues[0].title}
                        </h3>
                        <p className="text-white/60 line-clamp-2 mb-4">{issues[0].category} • {formatRelativeTime(issues[0].createdAt)}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-black" />)}
                          </div>
                          <span className="text-xs text-white/40">+{issues[0].upvoteCount || 0} students affected</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/30">
                        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                        <p>No trending issues</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions - Grid */}
              <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-gradient-to-br from-purple-900/40 to-black border border-white/10 p-6 flex flex-col justify-between group hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/issues/new'}>
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">New Report</h3>
                  <p className="text-xs text-white/50">Submit an issue instantly</p>
                </div>
              </div>

              <Link href="/qr-scanner" className="md:col-span-1 md:row-span-1 rounded-3xl bg-neutral-900 border border-white/10 p-6 flex flex-col justify-between group hover:border-cyan-500/50 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:rotate-90 transition-transform">
                  <Images className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white">Scan Zone</h3>
                  <p className="text-xs text-white/50">AR Location Finder</p>
                </div>
              </Link>

              {/* Leaderboard/Stats Mini */}
              <div className="md:col-span-2 md:row-span-1 rounded-3xl bg-neutral-900 border border-white/10 p-6 flex items-center justify-between">
                <div className="flex gap-4">
                  {leaders.slice(0, 3).map((leader, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg border-2 ${i === 0 ? 'border-amber-400 bg-amber-400/20 text-amber-300' :
                          i === 1 ? 'border-gray-400 bg-gray-400/20 text-gray-300' :
                            'border-orange-400 bg-orange-400/20 text-orange-300'
                        }`}>
                        {leader.name.charAt(0)}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase font-bold text-center w-16 truncate">{leader.name.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/40 mb-1">Top Contributors</div>
                  <Button variant="link" className="text-white p-0 h-auto font-bold flex items-center gap-2 justify-end">
                    View Leaderboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

            </div>
          </section>

          {/* Footer - Minimalist */}
          <footer className="border-t border-white/10 pt-10 pb-20 text-center">
            <p className="text-white/20 text-sm font-mono">DESIGNED FOR IMPACT.</p>
            <div className="mt-4 flex justify-center gap-6 opacity-30">
              <div className="h-2 w-2 rounded-full bg-white" />
              <div className="h-2 w-2 rounded-full bg-white" />
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}