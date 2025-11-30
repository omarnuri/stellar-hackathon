"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAllEvents, useEventCount, type FullEventData } from "@/hooks/use-all-events";
import { CATEGORIES } from "../create/create-event-form";

// Placeholder images for events
const PLACEHOLDER_IMAGES = [
  "/lock.png",
  "/hands.png",
  "/computer.png",
  "/watchtower.png",
];

// Get placeholder image based on contract ID (deterministic)
function getPlaceholderImage(contractId: string): string {
  const hash = contractId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
}

// Convert IPFS URL to gateway URL
function convertIpfsUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    const cid = url.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
}

// Get event image from metadata or fallback to placeholder
function getEventImage(event: FullEventData): string {
  const metadataImage = event.metadata?.image;
  if (metadataImage) {
    return convertIpfsUrl(metadataImage);
  }
  return getPlaceholderImage(event.event_contract);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

// Filter events based on search query and category
function filterEvents(
  events: FullEventData[] | undefined,
  searchQuery: string,
  selectedCategory: string | null
): FullEventData[] {
  if (!events) return [];

  return events.filter((event) => {
    // Search filter - check name, symbol, creator address
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      event.name.toLowerCase().includes(searchLower) ||
      event.symbol.toLowerCase().includes(searchLower) ||
      event.event_creator.toLowerCase().includes(searchLower) ||
      event.event_contract.toLowerCase().includes(searchLower);

    // Category filter - check if category is in event metadata or name
    // Since we don't have direct category in the contract, we check the metadata or name
    const matchesCategory =
      selectedCategory === null ||
      selectedCategory === "All" ||
      event.name.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });
}

export default function DiscoverPage() {
  const { data: events, isLoading, error } = useAllEvents();
  const { data: eventCount } = useEventCount();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtered events
  const filteredEvents = useMemo(
    () => filterEvents(events, searchQuery, selectedCategory),
    [events, searchQuery, selectedCategory]
  );

  // Category counts (based on filtered results if searching)
  const categories = useMemo(() => {
    const baseEvents = searchQuery ? filteredEvents : events;
    return [
      { name: "All", count: eventCount ?? events?.length ?? 0 },
      ...CATEGORIES.map((category) => ({
        name: category,
        count:
          baseEvents?.filter((event) =>
            event.name.toLowerCase().includes(category.toLowerCase())
          ).length || 0,
      })),
    ];
  }, [events, filteredEvents, searchQuery, eventCount]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Hero Section */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div className="md:col-span-2 p-8 md:p-12 space-y-6 border-b md:border-b-0">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                LIVE ON CHAIN
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                Discover Events
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Browse upcoming events, buy tickets as NFTs, and join the future
                of transparent ticketing.
              </p>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 border corner-accents flex items-center gap-2 px-3 py-2 hover:border-accent transition-colors focus-within:border-accent">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, symbol, or address..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {(searchQuery || selectedCategory) && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {/* Stats */}
            <div className="flex flex-col divide-y">
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-3xl font-bold text-accent">
                  {isLoading ? "..." : filteredEvents.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {searchQuery || selectedCategory
                    ? "Matching Events"
                    : "Live Events"}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-3xl font-bold text-accent">
                  {isLoading
                    ? "..."
                    : filteredEvents.reduce(
                        (sum, e) => sum + e.tickets_minted,
                        0
                      )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tickets Sold
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-3xl font-bold text-accent">XLM</div>
                <div className="text-xs text-muted-foreground">Network</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-2 md:grid-cols-8 divide-x divide-y md:divide-y-0">
            {categories.map((category) => {
              const isSelected =
                (selectedCategory === null && category.name === "All") ||
                selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() =>
                    setSelectedCategory(
                      category.name === "All" ? null : category.name
                    )
                  }
                  className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer group text-left ${
                    isSelected ? "bg-accent/10 " : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isSelected ? "text-accent" : "group-hover:text-accent"
                      }`}
                    >
                      {category.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        <div className="border border-t-0 corner-accents">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-muted-foreground">
                Loading events from chain...
              </p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-destructive">Failed to load events</p>
              <p className="text-xs text-muted-foreground mt-2">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y">
              {filteredEvents.map((event) => (
                <Link
                  key={event.event_contract}
                  href={`/discover/${event.event_contract}`}
                  className="p-6 hover:bg-muted/30 transition-colors group cursor-pointer flex flex-col"
                >
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Event Image */}
                    <div className="aspect-video border corner-accents overflow-hidden bg-black">
                      <div
                        className="w-full h-full  bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${getEventImage(event)})`,
                        }}
                      ></div>
                    </div>

                    {/* Event Info */}
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`px-2 py-1 text-xs font-bold rounded ${
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
                            : event.tickets_available < event.total_supply * 0.2
                            ? "SELLING FAST"
                            : "ON SALE"}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
                          {event.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.created_at)}
                        </p>
                        <p
                          className="text-xs text-muted-foreground font-mono truncate"
                          title={event.event_creator}
                        >
                          Creator: {event.event_creator.slice(0, 8)}...
                        </p>
                      </div>

                      <div className="grid grid-cols-2 divide-x border corner-accents mt-auto">
                        <div className="p-3">
                          <div className="text-xs text-muted-foreground">
                            Price
                          </div>
                          <div className="font-bold text-accent">
                            {event.primary_price} XLM
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="text-xs text-muted-foreground">
                            Available
                          </div>
                          <div className="font-bold">
                            {event.tickets_available}/{event.total_supply}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory
                  ? "No events match your search"
                  : "No events found"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "Be the first to create an event!"}
              </p>
              {searchQuery || selectedCategory ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/create">
                  <Button className="mt-4" variant="outline">
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border border-t-0 corner-accents p-8 text-center">
          <Link href="/create">
            <Button variant="outline" className="font-mono">
              Create New Event
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
