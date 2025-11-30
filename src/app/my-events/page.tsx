"use client";

import { useMemo } from "react";
import { MainLayout } from "@/components/layouts";
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  Loader2,
  QrCode,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useFreighter } from "@/providers/FreighterProvider";
import { FreighterConnect } from "@/components/FreighterConnect";
import {
  useCreatorEvents,
  calculateRevenue,
  calculateTotalTicketsSold,
} from "@/hooks/use-creator-events";
import { Button } from "@/components/ui/button";

// Placeholder images
const PLACEHOLDER_IMAGES = [
  "/lock.png",
  "/hands.png",
  "/computer.png",
  "/watchtower.png",
];

function getPlaceholderImage(contractId: string): string {
  const hash = contractId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
}

function convertIpfsUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    const cid = url.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyEventsPage() {
  const { isConnected, publicKey } = useFreighter();
  const { data: events, isLoading, error } = useCreatorEvents(publicKey);

  // Calculate stats
  const stats = useMemo(() => {
    if (!events) return null;
    return {
      totalEvents: events.length,
      totalTicketsSold: calculateTotalTicketsSold(events),
      totalRevenue: calculateRevenue(events),
      avgTicketPrice:
        events.length > 0
          ? events.reduce((sum, e) => sum + e.primary_price, 0) / events.length
          : 0,
    };
  }, [events]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div className="md:col-span-2 p-6 space-y-3 border-b md:border-b-0">
              <div className="flex items-center gap-3">
                {isConnected && publicKey && (
                  <div className="text-xs text-accent font-mono">
                    {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                My Events
              </h1>
              <p className="text-muted-foreground text-xs">
                &gt; CREATOR_DASHBOARD // MANAGE_YOUR_EVENTS
              </p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-1 divide-x md:divide-x-0 md:divide-y">
              <div className="p-4 hover:bg-muted/30 transition-colors">
                <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  [TOTAL_EVENTS]
                </div>
                <div className="text-xl font-bold text-accent mt-1">
                  {isLoading ? "..." : stats?.totalEvents || 0}
                </div>
              </div>
              <div className="p-4 hover:bg-muted/30 transition-colors">
                <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  [TOTAL_REVENUE]
                </div>
                <div className="text-xl font-bold text-accent mt-1">
                  {isLoading ? "..." : `${stats?.totalRevenue.toFixed(2) || 0} XLM`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        {isConnected && stats && (
          <div className="border border-t-0 corner-accents grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="w-4 h-4" />
                <span className="text-xs">Tickets Sold</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {stats.totalTicketsSold}
              </div>
            </div>
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Avg. Price</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {stats.avgTicketPrice.toFixed(2)} XLM
              </div>
            </div>
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-xs">Total Capacity</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {events?.reduce((sum, e) => sum + e.total_supply, 0) || 0}
              </div>
            </div>
            <div className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                <QrCode className="w-4 h-4" />
                <span className="text-xs">Check-Ins</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-muted-foreground">
                —
              </div>
            </div>
          </div>
        )}

        {/* Not Connected State */}
        {!isConnected && (
          <div className="border border-t-0 corner-accents p-8">
            <div className="max-w-sm mx-auto">
              <div className="border corner-accents p-6 bg-muted/5 space-y-4">
                <div className="border corner-accents w-12 h-12 bg-accent/10 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">[CONNECT_WALLET]</h2>
                  <p className="text-xs text-muted-foreground">
                    Connect Freighter to view your created events
                  </p>
                </div>
                <div className="flex justify-center">
                  <FreighterConnect />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isConnected && isLoading && (
          <div className="border border-t-0 corner-accents p-8 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">
              Loading your events...
            </p>
          </div>
        )}

        {/* Error State */}
        {isConnected && error && (
          <div className="border border-t-0 corner-accents p-6 text-center">
            <p className="text-destructive text-sm">Failed to load events</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {/* Events List */}
        {isConnected && !isLoading && !error && events && (
          <>
            {events.length > 0 ? (
              <div className="border border-t-0 corner-accents">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    [YOUR_EVENTS]
                  </h2>
                  <Link href="/create">
                    <Button variant="outline" size="sm" className="gap-2">
                      Create New
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>

                <div className="divide-y">
                  {events.map((event) => (
                    <div
                      key={event.event_contract}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Event Image */}
                        <div className="w-20 h-20 border corner-accents overflow-hidden bg-black shrink-0">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${
                                event.metadata?.image
                                  ? convertIpfsUrl(event.metadata.image)
                                  : getPlaceholderImage(event.event_contract)
                              })`,
                            }}
                          />
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-lg truncate">
                                {event.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Created {formatDate(event.created_at)}
                              </p>
                            </div>
                            <div
                              className={`px-2 py-1 text-xs font-bold rounded shrink-0 ${
                                event.tickets_available === 0
                                  ? "bg-destructive/10 text-destructive"
                                  : event.tickets_available <
                                    event.total_supply * 0.2
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-accent/10 text-accent"
                              }`}
                            >
                              {event.tickets_available === 0
                                ? "SOLD OUT"
                                : `${event.tickets_available} LEFT`}
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Sold
                              </div>
                              <div className="font-bold">
                                {event.tickets_minted}/{event.total_supply}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Revenue
                              </div>
                              <div className="font-bold text-accent">
                                {(
                                  event.tickets_minted * event.primary_price
                                ).toFixed(2)}{" "}
                                XLM
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Price
                              </div>
                              <div className="font-bold">
                                {event.primary_price} XLM
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <Link
                              href={`/discover/${event.event_contract}`}
                              className="flex-1"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-1"
                              >
                                View
                                <ArrowUpRight className="w-3 h-3" />
                              </Button>
                            </Link>
                            <Link
                              href={`/check-in/${event.event_contract}`}
                              className="flex-1"
                            >
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full gap-1"
                              >
                                <QrCode className="w-3 h-3" />
                                Check-In
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-t-0 corner-accents p-8">
                <div className="max-w-sm mx-auto">
                  <div className="border corner-accents p-6 bg-muted/5 space-y-4">
                    <div className="border corner-accents w-12 h-12 bg-accent/10 flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold">[NO_EVENTS_YET]</h2>
                      <p className="text-xs text-muted-foreground">
                        Create your first event and start selling tickets
                      </p>
                    </div>
                    <Link href="/create" className="block">
                      <div className="border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-3 py-2 bg-accent/5 text-sm font-bold">
                        [CREATE_EVENT]
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

