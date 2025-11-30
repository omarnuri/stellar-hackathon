"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layouts";
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  QrCode,
  Ticket,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFreighter } from "@/providers/FreighterProvider";
import { FreighterConnect } from "@/components/FreighterConnect";
import { useCheckIn, type CheckInResult } from "@/hooks/use-check-in";
import { useEventDetails } from "@/hooks/use-event-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckInHistory {
  ticketId: number;
  timestamp: Date;
  success: boolean;
  message: string;
}

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { isConnected, publicKey } = useFreighter();
  const { data: eventDetails, isLoading: eventLoading } =
    useEventDetails(eventId);
  const {
    isProcessing,
    lastResult,
    markTicketUsed,
    processQRCode,
    reset,
  } = useCheckIn(eventId);

  const [manualTicketId, setManualTicketId] = useState("");
  const [checkInHistory, setCheckInHistory] = useState<CheckInHistory[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if user is the event creator
  const isCreator =
    eventDetails && publicKey && eventDetails.event_creator === publicKey;

  // Add result to history
  const addToHistory = useCallback((result: CheckInResult) => {
    setCheckInHistory((prev) => [
      {
        ticketId: result.ticketId,
        timestamp: new Date(),
        success: result.success,
        message: result.message,
      },
      ...prev.slice(0, 49), // Keep last 50
    ]);
  }, []);

  // Handle last result changes
  useEffect(() => {
    if (lastResult) {
      addToHistory(lastResult);
    }
  }, [lastResult, addToHistory]);

  // Handle manual ticket ID submission
  const handleManualCheckIn = async () => {
    const ticketId = parseInt(manualTicketId, 10);
    if (isNaN(ticketId) || ticketId < 0) {
      return;
    }

    const result = await markTicketUsed(ticketId);
    if (result.success) {
      setManualTicketId("");
    }
  };

  // Start camera for QR scanning
  const startScanner = async () => {
    setScannerError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScannerActive(true);
    } catch (err) {
      console.error("Failed to start camera:", err);
      setScannerError(
        err instanceof Error ? err.message : "Failed to access camera"
      );
    }
  };

  // Stop camera
  const stopScanner = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Calculate stats
  const successCount = checkInHistory.filter((h) => h.success).length;
  const failureCount = checkInHistory.filter((h) => !h.success).length;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto md:px-0">
        {/* Header */}
        <div className="border border-t-0 corner-accents">
          <div className="p-6 space-y-3">
            <Link
              href="/my-events"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to My Events
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border corner-accents bg-accent/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">
                  Check-In Scanner
                </h1>
                {eventDetails && (
                  <p className="text-sm text-muted-foreground">
                    {eventDetails.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 divide-x border-t">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {successCount}
              </div>
              <div className="text-xs text-muted-foreground">Checked In</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {failureCount}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold">
                {eventDetails?.tickets_minted || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total Sold</div>
            </div>
          </div>
        </div>

        {/* Not Connected */}
        {!isConnected && (
          <div className="border border-t-0 corner-accents p-8">
            <div className="max-w-sm mx-auto text-center space-y-4">
              <div className="border corner-accents w-12 h-12 bg-accent/10 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold">[CONNECT_WALLET]</h2>
              <p className="text-xs text-muted-foreground">
                Connect your wallet to scan and check in tickets
              </p>
              <FreighterConnect />
            </div>
          </div>
        )}

        {/* Loading */}
        {isConnected && eventLoading && (
          <div className="border border-t-0 corner-accents p-8 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Loading event...</p>
          </div>
        )}

        {/* Not Creator Warning */}
        {isConnected && !eventLoading && !isCreator && (
          <div className="border border-t-0 corner-accents p-6">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-destructive">Access Denied</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Only the event creator can check in tickets. Please connect
                  with the creator wallet.
                </p>
                {eventDetails && (
                  <p className="text-xs font-mono text-muted-foreground mt-2">
                    Creator: {eventDetails.event_creator.slice(0, 8)}...
                    {eventDetails.event_creator.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Check-In Interface */}
        {isConnected && !eventLoading && isCreator && (
          <>
            {/* Scanner Area */}
            <div className="border border-t-0 corner-accents">
              <div className="p-4 border-b">
                <h2 className="font-bold">[QR_SCANNER]</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Camera View */}
                <div className="aspect-square max-w-sm mx-auto border corner-accents bg-black overflow-hidden relative">
                  {scannerActive ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-accent rounded-lg animate-pulse" />
                      </div>
                      <Button
                        onClick={stopScanner}
                        variant="destructive"
                        size="sm"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2"
                      >
                        Stop Scanner
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                      {scannerError ? (
                        <>
                          <AlertCircle className="w-12 h-12 text-destructive" />
                          <p className="text-sm text-destructive text-center">
                            {scannerError}
                          </p>
                          <Button onClick={startScanner} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                          </Button>
                        </>
                      ) : (
                        <>
                          <Camera className="w-12 h-12 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground text-center">
                            Camera preview will appear here
                          </p>
                          <Button onClick={startScanner} className="gap-2">
                            <Camera className="w-4 h-4" />
                            Start Scanner
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Point camera at a ticket QR code to scan
                </p>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="border border-t-0 corner-accents">
              <div className="p-4 border-b">
                <h2 className="font-bold">[MANUAL_ENTRY]</h2>
              </div>

              <div className="p-6">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter Ticket ID..."
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
                    min={0}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleManualCheckIn}
                    disabled={!manualTicketId || isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Check In
                  </Button>
                </div>
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="border border-t-0 corner-accents">
                <div
                  className={`p-6 ${
                    lastResult.success ? "bg-accent/10" : "bg-destructive/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        lastResult.success
                          ? "bg-accent text-white"
                          : "bg-destructive text-white"
                      }`}
                    >
                      {lastResult.success ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <X className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {lastResult.success ? "Check-In Successful!" : "Check-In Failed"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{lastResult.ticketId} — {lastResult.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="mt-4"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Check-In History */}
            {checkInHistory.length > 0 && (
              <div className="border border-t-0 corner-accents">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-bold">[CHECK_IN_HISTORY]</h2>
                  <span className="text-xs text-muted-foreground">
                    {checkInHistory.length} entries
                  </span>
                </div>

                <div className="divide-y max-h-64 overflow-y-auto">
                  {checkInHistory.map((entry, index) => (
                    <div
                      key={`${entry.ticketId}-${entry.timestamp.getTime()}-${index}`}
                      className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.success
                              ? "bg-accent/10 text-accent"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {entry.success ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm flex items-center gap-2">
                            <Ticket className="w-3 h-3" />
                            Ticket #{entry.ticketId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.message}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

