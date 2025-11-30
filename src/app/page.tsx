"use client";
import Dither from "@/components/Dither";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { FreighterConnect } from "@/components/FreighterConnect";
import { useAllEvents, useEventCount, type FullEventData } from "@/hooks/use-all-events";
import { useMemo } from "react";

// Format timestamp to readable date
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
}

// Get event status based on availability
function getEventStatus(event: FullEventData): string {
  if (event.tickets_available === 0) return "SOLD OUT";
  if (event.tickets_available < event.total_supply * 0.2) return "SELLING FAST";
  if (event.tickets_available < event.total_supply * 0.5) return "ALMOST SOLD";
  return "ON SALE";
}

// Truncate address
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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

export default function Home() {
  const { data: events, isLoading, error } = useAllEvents();
  const { data: eventCount } = useEventCount();

  // Get top 3 events for display
  const displayEvents = useMemo(() => {
    if (!events) return [];
    return events.slice(0, 3);
  }, [events]);

  // Generate simulated activity from events data
  const recentActivity = useMemo(() => {
    if (!events || events.length === 0) return [];

    const activityTypes = ["PURCHASE", "TRANSFER", "MINT"];
    const times = [
      "2m ago",
      "5m ago",
      "8m ago",
      "12m ago",
      "15m ago",
      "18m ago",
    ];

    return events.slice(0, 6).flatMap((event, index) => ({
      type: activityTypes[index % activityTypes.length],
      user: truncateAddress(event.event_creator),
      event: event.name,
      amount: event.tickets_minted > 0 ? `${event.primary_price} XLM` : "—",
      time: times[index % times.length],
    }));
  }, [events]);

  // Stats calculated from live data
  const stats = useMemo(() => {
    if (!events) return { totalEvents: eventCount ?? 0, ticketsSold: 0, totalAvailable: 0 };
    return {
      // Use direct event count from contract if available, otherwise fall back to events length
      totalEvents: eventCount ?? events.length,
      ticketsSold: events.reduce((sum, e) => sum + e.tickets_minted, 0),
      totalAvailable: events.reduce((sum, e) => sum + e.tickets_available, 0),
    };
  }, [events, eventCount]);

  const features = [
    {
      title: "Secure & Verifiable",
      description:
        "Every ticket exists on Stellar — immutable, transparent, and linked to its rightful owner.",
      image: "/lock.png",
    },
    {
      title: "Transfer or Trade Freely",
      description:
        "Users can transfer or resell tickets directly through their wallets — no hidden commissions.",
      image: "/hands.png",
    },
    {
      title: "Event Manager Dashboard",
      description:
        "Organizers can create events, set prices, define rules, and track ticket sales in real-time.",
      image: "/computer.png",
    },
    {
      title: "Seamless Wallet Integration",
      description:
        "Supports MetaMask, WalletConnect, and more — mint, buy, and check in with one click.",
      image: "/watchtower.png",
    },
  ];

  return (
    <div className="max-w-5xl  mx-auto  md:px-0">
      <div className="relative w-full border corner-accents">
        <div className=" absolute   h-full opacity-50 z-0 w-full overflow-hidden">
          <Dither
            waveColor={[1, 1, 1]}
            disableAnimation={false}
            enableMouseInteraction={true}
            mouseRadius={1}
            colorNum={2}
            pixelSize={3}
            waveAmplitude={0.3}
            waveFrequency={4}
            waveSpeed={0.02}
          />
        </div>
        <div className="absolute inset-0  z-[20]  w-full [background:radial-gradient(125%_125%_at_0%_0%,transparent_20%,black_100%)]"></div>
        <div className="relative  z-[40] space-y-4 ">
          <div className="p-4 absolute flex justify-between items-center w-full">
            <Link
              href="/"
              className="bg-white flex gap-1 items-center  font-medium tracking-tighter text-black relative rounded-full w-fit px-4 !pr-5 py-2"
            >
              <div className="text-accent">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.28">
                    <path
                      d="M6.6867 2.83747C6.60714 2.35443 6.18956 2 5.7 2C5.21044 2 4.79286 2.35443 4.7133 2.83748C4.6133 3.44455 4.39371 3.8516 4.1155 4.1271C3.83631 4.40358 3.42903 4.61586 2.83748 4.7133C2.35443 4.79286 2 5.21044 2 5.7C2 6.18956 2.35443 6.60714 2.83747 6.6867C3.44455 6.7867 3.8516 7.00629 4.1271 7.2845C4.40358 7.56369 4.61586 7.97097 4.7133 8.56252C4.79286 9.04557 5.21044 9.4 5.7 9.4C6.18956 9.4 6.60714 9.04557 6.6867 8.56253C6.78414 7.97097 6.99642 7.56369 7.2729 7.2845C7.5484 7.00629 7.95545 6.7867 8.56253 6.6867C9.04557 6.60714 9.4 6.18956 9.4 5.7C9.4 5.21044 9.04557 4.79286 8.56252 4.7133C7.95545 4.6133 7.5484 4.39371 7.2729 4.1155C6.99642 3.83631 6.78414 3.42902 6.6867 2.83747Z"
                      fill="currentColor"
                    />
                    <path
                      d="M6 17.65C6 17.0977 5.55228 16.65 5 16.65C4.44772 16.65 4 17.0977 4 17.65V18H3.65C3.09772 18 2.65 18.4477 2.65 19C2.65 19.5523 3.09772 20 3.65 20H4V20.35C4 20.9023 4.44772 21.35 5 21.35C5.55228 21.35 6 20.9023 6 20.35V20H6.35C6.90228 20 7.35 19.5523 7.35 19C7.35 18.4477 6.90228 18 6.35 18H6V17.65Z"
                      fill="currentColor"
                    />
                  </g>
                  <path
                    d="M13.8921 2.87392C13.8286 2.3744 13.4036 2 12.9 2C12.3965 2 11.9715 2.3744 11.908 2.87392C11.5859 5.40808 10.9021 7.2346 9.78974 8.51626C8.69232 9.78066 7.07626 10.6306 4.64504 11.0121C4.15855 11.0884 3.80005 11.5076 3.80005 12C3.80005 12.4924 4.15855 12.9116 4.64504 12.9879C7.07626 13.3694 8.69232 14.2193 9.78974 15.4837C10.9021 16.7654 11.5859 18.5919 11.908 21.1261C11.9715 21.6256 12.3965 22 12.9 22C13.4036 22 13.8286 21.6256 13.8921 21.1261C14.2142 18.5919 14.898 16.7654 16.0104 15.4837C17.1078 14.2193 18.7238 13.3694 21.1551 12.9879C21.6415 12.9116 22 12.4924 22 12C22 11.5076 21.6415 11.0884 21.1551 11.0121C18.5917 10.6099 16.9738 9.7062 15.9072 8.42658C14.8209 7.12345 14.2012 5.30628 13.8921 2.87392Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              Sticket
            </Link>
            <Link href="/discover">
              <div className="!bg-accent/30 backdrop-blur-md h-fit hover:bg-accent/50 transition-colors cursor-pointer corner-accents border border-accent/20 text-accent px-3 py-1 w-fit font-medium">
                Get Started
              </div>
            </Link>
          </div>
          <div className="p-8 md:p-20  flex flex-col items-center justify-center gap-4 py-40 lg:p-40">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center tracking-tighter">
              Own Your Tickets.
              <br />
              Trade Them Freely.
            </h1>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x border border-t-0 corner-accents">
        <div className="md:col-span-2 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full md:divide-x">
            <div className="md:col-span-2 p-6 md:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                POWERED BY STELLAR
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                The first truly transparent ticketing platform.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Tickets as NFTs. No middlemen, no hidden fees, full ownership.
                Every transaction is verifiable on-chain.
              </p>
              {/* <Link href="/discover">
                <div className="border corner-accents flex hover:bg-accent/5 cursor-pointer hover:border-accent hover:text-accent transition-colors items-center justify-between px-2 py-2">
                  Learn More
                  <ArrowUpRight className="w-4 h-4 text-accent" />
                </div>
              </Link> */}
            </div>
            <div className="flex flex-col md:flex-col divide-y md:divide-y">
              <div className="p-4 md:p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-3xl font-bold text-accent">
                  {isLoading ? "..." : stats.totalEvents}
                </div>
                <div className="text-sm text-muted-foreground">Live Events</div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-3xl font-bold text-accent">
                  {isLoading ? "..." : stats.ticketsSold}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tickets Sold
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-3xl font-bold text-accent">XLM</div>
                <div className="text-sm text-muted-foreground">Network</div>
              </div>
            </div>
          </div>
        </div>
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex group nth-[2]:border-b flex-col justify-end aspect-square border-b md:border-b-0"
          >
            <div
              className="bg-black flex-1 bg-contain bg-center  bg-no-repeat"
              style={{
                backgroundImage: `url(${feature.image})`,
              }}
            ></div>
            <div className="p-4 border-t">
              <h2 className="flex items-center gap-2">
                <div className="w-1 h-4 group-hover:bg-accent transition-colors bg-muted rounded-full"></div>
                {feature.title}
              </h2>
              <p className=" text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border border-t-0 corner-accents">
        <div
          className="p-6 md:p-8 border-b"
          style={{
            backgroundImage: `url(/bg.png)`,
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Explore Live Events
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Discover upcoming events on the blockchain
              </p>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="font-mono gap-2">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
          {isLoading ? (
            <div className="md:col-span-3 p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">
                Loading events from chain...
              </p>
            </div>
          ) : error ? (
            <div className="md:col-span-3 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Failed to load events
              </p>
            </div>
          ) : displayEvents.length === 0 ? (
            <div className="md:col-span-3 p-12 text-center">
              <p className="text-muted-foreground">No events yet</p>
              <Link href="/create">
                <Button variant="outline" className="mt-4 font-mono">
                  Create First Event
                </Button>
              </Link>
            </div>
          ) : (
            displayEvents.map((event) => {
              const status = getEventStatus(event);
              const statusColor =
                status === "SOLD OUT"
                  ? "bg-destructive/10 text-destructive"
                  : status === "SELLING FAST" || status === "ALMOST SOLD"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-accent/10 text-accent";
              return (
                <Link
                  key={event.event_contract}
                  href={`/discover/${event.event_contract}`}
                  className="p-6 pb-2 hover:bg-muted/30 transition-colors group cursor-pointer border-b md:border-b-0"
                >
                  <div className="space-y-4">
                    {/* Event Image */}
                    <div className="aspect-video border corner-accents overflow-hidden bg-black rounded-lg">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${getEventImage(event)})`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`px-2 py-1 text-xs font-bold rounded ${statusColor}`}
                      >
                        {status}
                      </div>
                      <div className="text-xs text-muted-foreground border px-2 py-1 rounded">
                        {formatDate(event.created_at)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {truncateAddress(event.event_creator)}
                      </p>
                    </div>
                    <div className="flex items-end justify-between pt-2 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Price
                        </div>
                        <div className="font-bold text-accent">
                          {event.primary_price} XLM
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Available
                        </div>
                        <div className="font-bold">
                          {event.tickets_available}/{event.total_supply}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
      <div className="border border-t-0 corner-accents">
        <div
          className="p-6 md:p-8 border-b"
          style={{
            backgroundImage: `url(/bg.png)`,
            backgroundSize: "contain",
            backgroundPosition: "right",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Link href="/rewards">
              <Button className="font-mono gap-2">
                Play
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-right">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Earn Rewards
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete challenges and earn tokens
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-t-0 grid grid-cols-1 md:grid-cols-3 md:divide-x corner-accents">
        <div className="md:col-span-2 p-6 md:p-8 space-y-6 flex flex-col justify-center border-b md:border-b-0">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              Launch Your Event in Minutes
            </h2>
            <p className="text-muted-foreground">
              Create tickets, set prices, define royalties. Watch sales happen
              live on-chain with zero hassle.
            </p>
            <div className="grid grid-cols-3 divide-x border">
              <div className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-accent">
                  5 min
                </div>
                <div className="text-xs text-muted-foreground">Setup Time</div>
              </div>
              <div className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-accent">
                  0%
                </div>
                <div className="text-xs text-muted-foreground">Hidden Fees</div>
              </div>
              <div className="p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-accent">
                  100%
                </div>
                <div className="text-xs text-muted-foreground">
                  Your Control
                </div>
              </div>
            </div>
            <Link href="/create" className="w-full">
              <div className="border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-3 bg-accent/5 font-mono">
                Create Your Event
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
        <div className="md:col-span-1 flex flex-col max-h-96 md:max-h-none">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Activity</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                <span className="text-xs text-muted-foreground">LIVE</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No activity yet
                    </p>
                  </div>
                ) : (
                  [...recentActivity, ...recentActivity].map(
                    (activity, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-muted/30 transition-colors border-b"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {activity.user}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {activity.event}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-bold ">
                              {activity.amount}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
