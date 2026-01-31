"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout";
import { IssuesList } from "@/components/issues";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/ui/command-palette";
import { Plus } from "lucide-react";
import { ParticleBackground } from "@/components/ui/particle-background";

export default function IssuesPage() {
  return (
    <AppShell title="Community">
      <div className="relative min-h-screen">
        <ParticleBackground className="opacity-30" />

        <div className="relative z-10 space-y-8">
          {/* Top Banner & Search */}
          <div className="flex flex-col gap-6">
            <CommandPalette />

            <Card className="border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
              <CardContent className="flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between relative z-10">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Share a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">hostel issue</span>
                  </h2>
                  <p className="text-zinc-400 max-w-lg">
                    Post a new report so your hostel community can upvote and track resolution.
                    Your voice matters in keeping the campus better.
                  </p>
                </div>
                <Link href="/issues/new">
                  <Button size="lg" className="w-full md:w-auto shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 transition-all hover:scale-105">
                    <Plus className="mr-2 h-5 w-5" /> Start a Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <IssuesList
            title="Community Feed"
            showFilters
            showViewToggle
            showSearch
            defaultView="grid"
            queryParams={{ scope: "college" }}
          />
        </div>
      </div>
    </AppShell>
  );
}
