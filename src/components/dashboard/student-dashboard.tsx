"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  ArrowRight,
  Building2
} from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";
import { BentoGrid } from "@/components/ui/bento-grid";
import { IsometricCard } from "@/components/ui/isometric-card";
import { HeroSection } from "@/components/dashboard/hero-section";
import { LiveTicker } from "@/components/dashboard/live-ticker";
import { CampusPodium } from "@/components/dashboard/campus-podium";
import { MomentumChart } from "@/components/dashboard/momentum-chart";
import { InfiniteCarousel } from "@/components/dashboard/infinite-carousel";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { CampusMap3D } from "@/components/dashboard/campus-map-3d";

interface DashboardStats {
  openIssues: number;
  resolvedIssues: number;
  myIssues: number;
  karmaScore: number;
  avgResponseTime: string;
  communityMomentum: number;
}

export function StudentDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    openIssues: 0,
    resolvedIssues: 0,
    myIssues: 0,
    karmaScore: 0,
    avgResponseTime: "--",
    communityMomentum: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-purple-500 animate-spin-slow"></div>
          </div>
          <p className="text-white/50 text-sm animate-pulse">Initializing HostelHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20 relative overflow-x-hidden">
      <ParticleBackground particleCount={40} />

      {/* Live Activity Ticker */}
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* 3D Hero Section */}
        <HeroSection />

        {/* Bento Grid Layout */}
        <BentoGrid className="mb-12">

          {/* 1. Stats Column (2 rows) */}
          <div className="md:col-span-2 row-span-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <IsometricCard
              title="Open Issues"
              value={stats.openIssues.toString()}
              icon={<AlertTriangle />}
              trend={{ value: 0, isPositive: false }}
              color="orange"
              delay={1}
            />
            <IsometricCard
              title="Resolved"
              value={stats.resolvedIssues.toString()}
              icon={<CheckCircle2 />}
              trend={{ value: 0, isPositive: true }}
              color="green"
              delay={2}
            />
          </div>


          {/* 2. Campus Overview (Map) */}
          <div className="md:col-span-1 md:row-span-2">
            <GlassmorphicCard className="h-full flex flex-col p-0 overflow-hidden group">
              <CampusMap3D />
            </GlassmorphicCard>
          </div>

          {/* 3. More Stats */}
          <div className="md:col-span-2 row-span-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <IsometricCard
              title="Avg. Response"
              value={stats.avgResponseTime}
              icon={<Clock />}
              color="blue"
              delay={3}
            />
            <IsometricCard
              title="Karma Points"
              value={stats.karmaScore.toLocaleString()}
              icon={<TrendingUp />}
              trend={{ value: 0, isPositive: true }}
              color="purple"
              delay={4}
            />
          </div>

          {/* 4. Leaders (Tall) */}
          <div className="md:col-span-1 md:row-span-2">
            <GlassmorphicCard className="h-full p-0 overflow-hidden bg-gradient-to-b from-white/10 to-transparent">
              <CampusPodium />
            </GlassmorphicCard>
          </div>

          {/* 5. Momentum (Wide) */}
          <div className="md:col-span-2 md:row-span-1">
            <GlassmorphicCard className="h-full p-0 overflow-hidden">
              <div className="grid grid-cols-2 h-full">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-white mb-2">Community Momentum</h3>
                  <p className="text-sm text-gray-400 mb-6">Your campus is resolving issues faster than 80% of other hostels. Keep it up!</p>

                  <button className="w-fit flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors group">
                    View Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="relative">
                  <MomentumChart />
                </div>
              </div>
            </GlassmorphicCard>
          </div>

        </BentoGrid>

        {/* Bottom Carousel */}
        <InfiniteCarousel />

      </div>
    </div>
  );
}
