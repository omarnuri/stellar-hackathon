"use client";

import { cn } from "@/lib/utils";
import { useFreighter } from "@/providers/FreighterProvider";
import {
  CalendarPlus,
  Check,
  ChevronsUpDown,
  Compass,
  Copy,
  ExternalLink,
  FolderKanban,
  LogOut,
  Plus,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FreighterConnect } from "./FreighterConnect";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Navigation links with icons
const navigationLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/tickets", label: "My Tickets", icon: Ticket },
  { href: "/my-events", label: "My Events", icon: FolderKanban },
  { href: "/create", label: "Create Event", icon: CalendarPlus },
];

// Logo component for reuse
function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g opacity="0.28">
        <path
          d="M6.6867 2.83747C6.60714 2.35443 6.18956 2 5.7 2C5.21044 2 4.79286 2.35443 4.7133 2.83748C4.6133 3.44455 4.39371 3.8516 4.1155 4.1271C3.83631 4.40358 3.42903 4.61586 2.83748 4.7133C2.35443 4.79286 2 5.21044 2 5.7C2 6.18956 2.35443 6.60714 2.83747 6.6867C3.44455 6.7867 3.8516 7.00629 4.1271 7.2845C4.40358 7.56369 4.61586 7.97097 4.7133 8.56252C4.79286 9.04557 5.21044 9.4 5.7 9.4C6.18956 9.4 6.60714 9.04557 6.6867 8.56253C6.78414 7.97097 6.99642 7.56369 7.2729 7.2845C7.5484 7.00629 7.95545 6.7867 8.56253 6.6867C9.04557 6.60714 9.4 6.18956 9.4 5.7C9.4 5.21044 9.04557 4.79286 8.56252 4.7133C7.95545 4.6133 7.5484 4.39371 7.2729 4.1155C6.99642 3.83631 6.78414 3.42902 6.6867 2.83747Z"
          fill="#FC3038"
        />
        <path
          d="M6 17.65C6 17.0977 5.55228 16.65 5 16.65C4.44772 16.65 4 17.0977 4 17.65V18H3.65C3.09772 18 2.65 18.4477 2.65 19C2.65 19.5523 3.09772 20 3.65 20H4V20.35C4 20.9023 4.44772 21.35 5 21.35C5.55228 21.35 6 20.9023 6 20.35V20H6.35C6.90228 20 7.35 19.5523 7.35 19C7.35 18.4477 6.90228 18 6.35 18H6V17.65Z"
          fill="#FC3038"
        />
      </g>
      <path
        d="M13.8921 2.87392C13.8286 2.3744 13.4036 2 12.9 2C12.3965 2 11.9715 2.3744 11.908 2.87392C11.5859 5.40808 10.9021 7.2346 9.78974 8.51626C8.69232 9.78066 7.07626 10.6306 4.64504 11.0121C4.15855 11.0884 3.80005 11.5076 3.80005 12C3.80005 12.4924 4.15855 12.9116 4.64504 12.9879C7.07626 13.3694 8.69232 14.2193 9.78974 15.4837C10.9021 16.7654 11.5859 18.5919 11.908 21.1261C11.9715 21.6256 12.3965 22 12.9 22C13.4036 22 13.8286 21.6256 13.8921 21.1261C14.2142 18.5919 14.898 16.7654 16.0104 15.4837C17.1078 14.2193 18.7238 13.3694 21.1551 12.9879C21.6415 12.9116 22 12.4924 22 12C22 11.5076 21.6415 11.0884 21.1551 11.0121C18.5917 10.6099 16.9738 9.7062 15.9072 8.42658C14.8209 7.12345 14.2012 5.30628 13.8921 2.87392Z"
        fill="#FC3038"
      />
    </svg>
  );
}

function WalletDisplay() {
  const { isConnected, publicKey, disconnect, network } = useFreighter();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey);
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy address");
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch {
      toast.error("Failed to disconnect wallet");
    }
  };

  // Generate initials from public key
  const getInitials = (key: string) => {
    return key.slice(0, 2).toUpperCase();
  };

  if (isConnected && publicKey) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 border corner-accents px-2 py-1.5 rounded hover:bg-muted/30 transition-colors cursor-pointer outline-none data-[state=open]:bg-muted/30">
            <Avatar className="h-3 w-3 rounded-lg">
              <AvatarFallback className="rounded-lg bg-accent text-accent text-xs font-bold"></AvatarFallback>
            </Avatar>
            <div className="grid flex-1 py-1 text-left text-sm leading-tight ">
              <span className="truncate font-medium text-xs">
                {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
              </span>
              {/* <span className="truncate text-xs text-muted-foreground">
                {network || "Stellar"}
              </span> */}
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground max-md:hidden" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-accent/10 text-accent text-xs font-bold">
                  {getInitials(publicKey)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {publicKey.slice(0, 8)}...{publicKey.slice(-6)}
                </span>
                <span className="truncate text-xs text-muted-foreground font-mono">
                  {network || "Stellar Network"}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/tickets">
                <Ticket />
                My Tickets
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/my-events">
                <FolderKanban />
                My Events
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCopyAddress}
              className="cursor-pointer"
            >
              {copied ? <Check className="text-green-500" /> : <Copy />}
              {copied ? "Copied!" : "Copy Address"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <a
                href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink />
                View on Explorer
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            variant="destructive"
            className="cursor-pointer"
          >
            <LogOut />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <FreighterConnect />;
}

interface HeaderProps {
  variant?: "default" | "transparent";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const pathname = usePathname();

  const isTransparent = variant === "transparent";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 md:px-6",
        isTransparent
          ? "absolute w-full bg-transparent border-b-0"
          : "border-b bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "group size-8 md:hidden",
                  isTransparent && "text-white hover:bg-white/10"
                )}
                size="icon"
                variant="ghost"
              >
                <svg
                  className="pointer-events-none"
                  fill="none"
                  height={16}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width={16}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="-translate-y-[7px] origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    d="M4 12L20 12"
                  />
                  <path
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    d="M4 12H20"
                  />
                  <path
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    d="M4 12H20"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-52 p-2 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0.5">
                  {navigationLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavigationMenuItem className="w-full" key={link.href}>
                        <NavigationMenuLink
                          active={pathname === link.href}
                          className="py-2.5 flex active:opacity-50 focus:opacity-65 flex-row items-center px-3 w-full justify-start gap-3"
                          href={link.href}
                        >
                          <Icon className="w-4 h-4 " />
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
              {/* Mobile Wallet Section */}
            </PopoverContent>
          </Popover>

          {/* Logo & Main nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                "flex gap-1 items-center font-medium tracking-tighter hover:opacity-80 transition-opacity",
                isTransparent
                  ? "bg-white text-black rounded-full px-4 !pr-5 py-2"
                  : "text-foreground"
              )}
            >
              <Logo className={isTransparent ? "text-accent" : ""} />
              Sticket
            </Link>

            {/* Desktop Navigation - only show on default variant */}
            {!isTransparent && (
              <NavigationMenu className="max-md:hidden">
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      active={pathname === "/discover"}
                      className="py-1.5 font-medium text-muted-foreground hover:text-primary"
                      href="/discover"
                    >
                      Discover
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      active={pathname === "/tickets"}
                      className="py-1.5 font-medium text-muted-foreground hover:text-primary"
                      href="/tickets"
                    >
                      My Tickets
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      active={pathname === "/my-events"}
                      className="py-1.5 font-medium text-muted-foreground hover:text-primary"
                      href="/my-events"
                    >
                      My Events
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isTransparent && (
            <Link href="/create" className="max-md:hidden">
              <Button variant="outline" className="font-mono gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </Link>
          )}
          <WalletDisplay />
        </div>
      </div>
    </header>
  );
}
