import { useQuery } from "@tanstack/react-query";
import {
  Client as NftClient,
  EventInfo,
  SecondaryListing as ContractSecondaryListing,
} from "../../sticket-contracts/packages/sticket-nft-collections/src/index";
import { networks } from "../../sticket-contracts/packages/sticket-factory/src/index";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;

// Convert stroops to XLM (1 XLM = 10,000,000 stroops)
const STROOPS_TO_XLM = 10_000_000;

function createNftClient(contractId: string): NftClient {
  return new NftClient({
    contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
  });
}

// Secondary listing with additional computed fields
export interface SecondaryListingData {
  ticket_id: number;
  seller: string;
  price: number; // In XLM
  price_stroops: bigint;
}

// Full event details
export interface EventDetails {
  // Contract info
  contractId: string;

  // Event info
  name: string;
  symbol: string;
  event_creator: string;
  event_metadata: string;
  payment_token: string;
  event_image: string;
  event_date: string;
  event_time: string;
  event_location: string;
  event_category: string;
  event_contact: string;
  // Pricing
  primary_price: number; // In XLM
  primary_price_stroops: bigint;
  creator_fee_bps: number;
  creator_fee_percent: number;

  // Supply
  total_supply: number;
  tickets_available: number;
  tickets_minted: number;

  // Secondary market
  secondary_listings: SecondaryListingData[];

  // Metadata (parsed if IPFS)
  metadata?: EventMetadata | null;
}

// Metadata structure (from IPFS)
export interface EventMetadata {
  description?: string;
  dateTime?: string;
  locationAddress?: string;
  category?: string;
  image?: string;
  contact?: string;
  secondaryMarketFee?: number;
}

async function fetchMetadata(
  metadataUrl: string
): Promise<EventMetadata | null> {
  if (!metadataUrl) return null;

  try {
    // Handle IPFS URLs
    const fetchUrl = metadataUrl;

    const response = await fetch(fetchUrl);
    console.log(response);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    return null;
  }
}

async function fetchEventDetails(contractId: string): Promise<EventDetails> {
  const client = createNftClient(contractId);

  // Fetch all data in parallel
  const [eventInfoTx, availableTx, mintedTx, listingsTx] = await Promise.all([
    client.get_event_info(),
    client.get_tickets_available(),
    client.get_tickets_minted(),
    client.get_all_secondary_listings(),
  ]);

  const [eventInfoResult, availableResult, mintedResult, listingsResult] =
    await Promise.all([
      eventInfoTx.simulate(),
      availableTx.simulate(),
      mintedTx.simulate(),
      listingsTx.simulate(),
    ]);

  const eventInfo = eventInfoResult.result as EventInfo;
  const ticketsAvailable = (availableResult.result as number) || 0;
  const ticketsMinted = (mintedResult.result as number) || 0;
  const listings = (listingsResult.result as ContractSecondaryListing[]) || [];

  // Fetch metadata from IPFS
  console.log(eventInfo);
  const metadata = await fetchMetadata(eventInfo.event_metadata);
  // Convert secondary listings
  const secondaryListings: SecondaryListingData[] = listings.map((listing) => ({
    ticket_id: listing.ticket_id,
    seller: listing.seller,
    price: Number(listing.price) / STROOPS_TO_XLM,
    price_stroops: listing.price,
  }));

  const eventDetails: EventDetails = {
    contractId,
    name: eventInfo.name,
    symbol: eventInfo.symbol,
    event_creator: eventInfo.event_creator,
    event_metadata: eventInfo.event_metadata,
    event_image: metadata?.image || "",
    event_date: metadata?.dateTime || "",
    event_time: metadata?.dateTime || "",
    event_location: metadata?.locationAddress || "",
    event_category: metadata?.category || "",
    event_contact: metadata?.contact || "",
    payment_token: eventInfo.payment_token,
    primary_price: Number(eventInfo.primary_price) / STROOPS_TO_XLM,
    primary_price_stroops: eventInfo.primary_price,
    creator_fee_bps: eventInfo.creator_fee_bps,
    creator_fee_percent: eventInfo.creator_fee_bps / 100,
    total_supply: eventInfo.total_supply,
    tickets_available: ticketsAvailable,
    tickets_minted: ticketsMinted,
    secondary_listings: secondaryListings,
    metadata,
  };
  console.log(eventDetails);
  return eventDetails;
}

export function useEventDetails(contractId: string | undefined) {
  return useQuery({
    queryKey: ["sticket-event", contractId],
    queryFn: () => fetchEventDetails(contractId!),
    enabled: !!contractId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Export helpers
export { createNftClient, STROOPS_TO_XLM };
