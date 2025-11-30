"use client";

import { useState, useCallback } from "react";
import { useFreighter } from "@/providers/FreighterProvider";
import {
  Client as NftClient,
  networks,
  TicketData,
} from "../../sticket-contracts/packages/sticket-nft-collections/src/index";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;

export interface CheckInResult {
  success: boolean;
  ticketId: number;
  message: string;
  ticketData?: TicketData;
}

export interface QRCodeData {
  type: string;
  ticketId: string;
  tokenId: string;
  contractAddress: string;
  eventName: string;
  eventDate: string;
  ownerAddress: string;
  timestamp: number;
}

function createNftClient(
  contractId: string,
  publicKey: string,
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedTxXdr: string; signerAddress: string }>,
  signAuthEntry: (
    entryXdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedAuthEntry: string | null; signerAddress: string }>
) {
  return new NftClient({
    contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: async (xdr: string) => {
      const result = await signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      return {
        signedTxXdr: result.signedTxXdr,
        signerAddress: result.signerAddress,
      };
    },
    signAuthEntry: async (entryXdr: string) => {
      const result = await signAuthEntry(entryXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (!result.signedAuthEntry) {
        throw new Error("Failed to sign auth entry");
      }
      return {
        signedAuthEntry: result.signedAuthEntry,
        signerAddress: result.signerAddress,
      };
    },
  });
}

export function useCheckIn(eventContractAddress: string) {
  const { publicKey, signTransaction, signAuthEntry } = useFreighter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);

  // Verify ticket ownership and status before check-in
  const verifyTicket = useCallback(
    async (ticketId: number): Promise<TicketData | null> => {
      if (!eventContractAddress) {
        throw new Error("Event contract address not provided");
      }

      try {
        const nftClient = new NftClient({
          contractId: eventContractAddress,
          networkPassphrase: NETWORK_PASSPHRASE,
          rpcUrl: RPC_URL,
        });

        const tx = await nftClient.get_ticket({ ticket_id: ticketId });
        const result = await tx.simulate();
        return result.result as TicketData;
      } catch (err) {
        console.error("Failed to verify ticket:", err);
        return null;
      }
    },
    [eventContractAddress]
  );

  // Mark ticket as used (check-in)
  const markTicketUsed = useCallback(
    async (ticketId: number): Promise<CheckInResult> => {
      if (!publicKey) {
        const result: CheckInResult = {
          success: false,
          ticketId,
          message: "Wallet not connected",
        };
        setLastResult(result);
        return result;
      }

      if (!eventContractAddress) {
        const result: CheckInResult = {
          success: false,
          ticketId,
          message: "Event contract address not provided",
        };
        setLastResult(result);
        return result;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // First verify the ticket
        const ticketData = await verifyTicket(ticketId);

        if (!ticketData) {
          const result: CheckInResult = {
            success: false,
            ticketId,
            message: "Ticket not found",
          };
          setLastResult(result);
          return result;
        }

        if (ticketData.is_used) {
          const result: CheckInResult = {
            success: false,
            ticketId,
            message: "Ticket already used",
            ticketData,
          };
          setLastResult(result);
          return result;
        }

        // Create client for signing transactions
        const nftClient = createNftClient(
          eventContractAddress,
          publicKey,
          signTransaction,
          signAuthEntry
        );

        // Mark ticket as used
        const tx = await nftClient.mark_ticket_used({
          creator: publicKey,
          ticket_id: ticketId,
        });

        await tx.signAndSend();

        const result: CheckInResult = {
          success: true,
          ticketId,
          message: "Check-in successful!",
          ticketData: { ...ticketData, is_used: true },
        };
        setLastResult(result);
        return result;
      } catch (err) {
        console.error("Check-in error:", err);
        const message =
          err instanceof Error ? err.message : "Check-in failed";

        // Parse common errors
        let friendlyMessage = message;
        if (message.includes("not the event creator")) {
          friendlyMessage = "Only the event creator can check in tickets";
        } else if (message.includes("already used")) {
          friendlyMessage = "This ticket has already been used";
        }

        setError(friendlyMessage);
        const result: CheckInResult = {
          success: false,
          ticketId,
          message: friendlyMessage,
        };
        setLastResult(result);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [
      publicKey,
      eventContractAddress,
      signTransaction,
      signAuthEntry,
      verifyTicket,
    ]
  );

  // Parse QR code data from scanned string
  const parseQRCode = useCallback(
    (qrData: string): QRCodeData | null => {
      try {
        const parsed = JSON.parse(qrData);

        // Validate required fields
        if (
          parsed.type !== "STICKET_CHECKIN" ||
          !parsed.ticketId ||
          !parsed.contractAddress
        ) {
          return null;
        }

        // Verify this QR is for the current event
        if (parsed.contractAddress !== eventContractAddress) {
          return null;
        }

        return parsed as QRCodeData;
      } catch {
        return null;
      }
    },
    [eventContractAddress]
  );

  // Process scanned QR code and check-in
  const processQRCode = useCallback(
    async (qrData: string): Promise<CheckInResult> => {
      const parsed = parseQRCode(qrData);

      if (!parsed) {
        const result: CheckInResult = {
          success: false,
          ticketId: 0,
          message: "Invalid QR code or wrong event",
        };
        setLastResult(result);
        return result;
      }

      // Extract ticket ID from token ID (e.g., "TICKET-1" -> 1)
      const ticketId = parseInt(parsed.tokenId.replace(/\D/g, ""), 10);

      if (isNaN(ticketId)) {
        const result: CheckInResult = {
          success: false,
          ticketId: 0,
          message: "Invalid ticket ID in QR code",
        };
        setLastResult(result);
        return result;
      }

      return markTicketUsed(ticketId);
    },
    [parseQRCode, markTicketUsed]
  );

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  return {
    // State
    isProcessing,
    error,
    lastResult,

    // Actions
    verifyTicket,
    markTicketUsed,
    parseQRCode,
    processQRCode,
    reset,
  };
}

export default useCheckIn;

