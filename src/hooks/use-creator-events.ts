"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Client as FactoryClient,
  networks,
  EventRecord,
} from "../../sticket-contracts/packages/sticket-factory/src/index";
import {
  Client as NftClient,
  EventInfo,
} from "../../sticket-contracts/packages/sticket-nft-collections/src/index";
import type { EventMetadata, FullEventData } from "./use-all-events";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
const STROOPS_TO_XLM = 10_000_000;

function createFactoryClient(): FactoryClient {
  return new FactoryClient({
    contractId: networks.testnet.contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
  });
}

function createNftClient(contractId: string): NftClient {
  return new NftClient({
    contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
  });
}

async function fetchMetadata(
  metadataUrl: string
): Promise<EventMetadata | null> {
  if (!metadataUrl) return null;

  try {
    let fetchUrl = metadataUrl;
    if (metadataUrl.startsWith("ipfs://")) {
      const cid = metadataUrl.replace("ipfs://", "");
      fetchUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    return null;
  }
}

async function fetchEventDetails(eventContract: string): Promise<{
  eventInfo: EventInfo | null;
  ticketsAvailable: number;
  ticketsMinted: number;
  metadata: EventMetadata | null;
}> {
  try {
    const nftClient = createNftClient(eventContract);

    const [eventInfoTx, availableTx, mintedTx] = await Promise.all([
      nftClient.get_event_info(),
      nftClient.get_tickets_available(),
      nftClient.get_tickets_minted(),
    ]);

    const [eventInfoResult, availableResult, mintedResult] = await Promise.all([
      eventInfoTx.simulate(),
      availableTx.simulate(),
      mintedTx.simulate(),
    ]);

    const eventInfo = (eventInfoResult.result as EventInfo) || null;

    const metadata = eventInfo?.event_metadata
      ? await fetchMetadata(eventInfo.event_metadata)
      : null;

    return {
      eventInfo,
      ticketsAvailable: (availableResult.result as number) || 0,
      ticketsMinted: (mintedResult.result as number) || 0,
      metadata,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${eventContract}:`, error);
    return {
      eventInfo: null,
      ticketsAvailable: 0,
      ticketsMinted: 0,
      metadata: null,
    };
  }
}

async function fetchCreatorEvents(
  creatorAddress: string
): Promise<FullEventData[]> {
  const factoryClient = createFactoryClient();
  const tx = await factoryClient.get_creator_events({ creator: creatorAddress });
  const result = await tx.simulate();

  if (result.result === undefined) {
    return [];
  }

  const events = result.result as EventRecord[];

  // Fetch details for each event in parallel
  const eventsWithDetails = await Promise.all(
    events.map(async (event, index) => {
      const details = await fetchEventDetails(event.event_contract);

      return {
        id: index,
        name: event.name,
        symbol: event.symbol,
        event_contract: event.event_contract,
        event_creator: event.event_creator,
        created_at: Number(event.created_at),
        total_supply: details.eventInfo?.total_supply || 0,
        tickets_available: details.ticketsAvailable,
        tickets_minted: details.ticketsMinted,
        primary_price: details.eventInfo
          ? Number(details.eventInfo.primary_price) / STROOPS_TO_XLM
          : 0,
        primary_price_stroops: details.eventInfo?.primary_price || BigInt(0),
        creator_fee_bps: details.eventInfo?.creator_fee_bps || 0,
        event_metadata: details.eventInfo?.event_metadata || "",
        payment_token: details.eventInfo?.payment_token || "",
        metadata: details.metadata,
      };
    })
  );

  return eventsWithDetails;
}

export function useCreatorEvents(creatorAddress: string | null | undefined) {
  return useQuery({
    queryKey: ["creator-events", creatorAddress],
    queryFn: () => fetchCreatorEvents(creatorAddress!),
    enabled: !!creatorAddress,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Calculate total revenue from ticket sales
export function calculateRevenue(events: FullEventData[]): number {
  return events.reduce((total, event) => {
    return total + event.tickets_minted * event.primary_price;
  }, 0);
}

// Calculate total tickets sold across all events
export function calculateTotalTicketsSold(events: FullEventData[]): number {
  return events.reduce((total, event) => total + event.tickets_minted, 0);
}

export default useCreatorEvents;

