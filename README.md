# 🎫 Sticket - Web3 NFT Ticketing Platform

A decentralized event ticketing platform built on **Stellar** that transforms tickets into Non-Fungible Tokens (NFTs). Built with Next.js, TypeScript, and Soroban smart contracts.

## 🌐 Live Demo

**🔗 [View Live Application](https://stellar-hackathon-85lb.vercel.app)**

## ✨ Features

- **NFT-Based Tickets**: Each ticket is a unique, verifiable NFT on Stellar
- **Zero Platform Fees**: 0% fees, organizers keep 100% of sales
- **Full Ownership**: Transfer, resell, or trade tickets freely
- **Blockchain Verification**: All tickets are immutable and verifiable on-chain
- **Primary & Secondary Markets**: Buy tickets directly or from resellers
- **Creator Royalties**: Automatic royalty payments on secondary sales
- **Event Check-in**: On-chain ticket validation to prevent fraud
- **Modern UI**: Beautiful, responsive design with retro tech aesthetic
- **Wallet Integration**: Connect with Freighter wallet
- **IPFS Storage**: Decentralized metadata and image storage via Pinata

## ⭐ Why Stellar? Outstanding Features

Sticket leverages Stellar's unique advantages to deliver the best ticketing experience:

### ⚡ Lightning-Fast Transactions

- **~5 second finality** - Instant ticket delivery, no waiting
- Real-time ticket availability updates
- Immediate confirmation for buyers and sellers

### 💰 Ultra-Low Costs

- **~$0.00001 per transaction** - Less than a cent per ticket operation
- Makes micro-transactions economically viable
- Enables affordable ticket pricing for all event types

### 🔧 Soroban Smart Contracts

- **Rust-based contracts** - Secure, auditable, and performant
- Factory pattern for efficient event deployment
- Built-in secondary marketplace and royalty system
- On-chain ticket validation to prevent fraud

### 🌍 Global & Permissionless

- **No geographic restrictions** - Access from anywhere in the world
- No KYC requirements for basic ticket operations
- Borderless event ticketing

### 💎 Native XLM Integration

- **Direct XLM payments** - No wrapped tokens or complex conversions
- Organizers receive payments instantly in native Stellar Lumens
- Simple, straightforward payment flow

### 🏭 Efficient Contract Deployment

- **Factory pattern** - Deploy new event contracts in seconds
- Deterministic contract addresses
- Reduced gas costs through contract reuse

### 🔐 Built-in Security

- **On-chain verification** - All tickets are immutable NFTs
- Smart contract enforced royalties
- Fraud prevention through blockchain validation

**Stellar is the perfect blockchain for ticketing** - combining speed, low cost, and powerful smart contract capabilities that make decentralized ticketing not just possible, but superior to traditional solutions.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A package manager (npm, yarn, pnpm, or bun)
- [Freighter Wallet](https://freighter.app/) (for wallet connection)

### Installation

```bash
# Install dependencies
bun install
# or
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_FACTORY_CONTRACT_ID=your_factory_contract_id
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
```

### Development

```bash
# Start development server
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
bun run build
# or
npm run build
```

## 📚 Documentation

For detailed information about the project, architecture, and development guidelines, see **[PROJECT_GUIDE.md](./info/PROJECT_GUIDE.md)**.

For smart contract documentation, see **[sticket-contracts/README.md](./sticket-contracts/README.md)**.

Additional documentation:

- **[CONTRACTS.md](./info/CONTRACTS.md)** - Smart contract details
- **[PITCH_DECK.md](./PITCH_DECK.md)** - Project pitch and vision

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **3D Graphics**: Three.js + React Three Fiber
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query (React Query)
- **Animations**: GSAP

### Blockchain

- **Network**: Stellar (Soroban smart contracts)
- **Wallet**: Freighter
- **SDK**: @stellar/stellar-sdk, @stellar/freighter-api
- **Storage**: IPFS via Pinata

### Smart Contracts

- **Language**: Rust
- **Platform**: Soroban (Stellar)
- **Contracts**: Factory pattern for event deployment, NFT collections for tickets

## 📁 Project Structure

```
sticket/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── create/             # Event creation
│   │   ├── discover/           # Event discovery & browsing
│   │   ├── tickets/             # User's ticket collection
│   │   ├── my-events/          # Creator's event management
│   │   ├── check-in/           # Event check-in system
│   │   ├── rewards/            # Rewards system
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── marketplace/        # Secondary market components
│   │   ├── tickets/            # Ticket-related components
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-all-events.ts   # Event fetching
│   │   ├── use-create-event.ts # Event creation
│   │   ├── use-ticket-actions.ts # Ticket operations
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── pinata.ts           # IPFS upload
│   │   └── utils.ts            # Helper functions
│   └── providers/              # Context providers
│       ├── AuthProvider.tsx    # Authentication
│       ├── FreighterProvider.tsx # Wallet connection
│       └── QueryProvider.tsx   # React Query setup
├── sticket-contracts/          # Smart contracts
│   ├── contracts/
│   │   ├── factory/            # Factory contract
│   │   └── nft_collections/     # NFT ticket contract
│   └── packages/               # TypeScript SDKs
├── public/                     # Static assets
└── package.json
```

## 🎯 Current Status

### ✅ Implemented

#### Frontend

- Complete UI/UX design system with retro tech aesthetic
- All page layouts and routing
- Component library (shadcn/ui)
- Responsive design
- Animated visual effects (Dither background)
- Wallet connection (Freighter)
- Event creation flow
- Event discovery and browsing
- Ticket management (view, send, sell)
- Secondary marketplace
- Check-in system
- Rewards system
- IPFS integration for metadata

#### Smart Contracts

- Factory contract for event deployment
- NFT collections contract for tickets
- Primary and secondary market functionality
- Creator royalties
- Ticket validation/check-in
- TypeScript SDKs generated

### 🚧 In Progress / Planned

- Mainnet deployment
- Enhanced analytics dashboard
- Mobile app
- Additional wallet integrations
- Advanced filtering and search
- Event analytics for creators

## 🔗 Key Pages

- **Landing** (`/`) - Hero, features, live events
- **Discover** (`/discover`) - Browse all events
- **Event Details** (`/discover/[id]`) - View event and buy tickets
- **Create Event** (`/create`) - Deploy new event contracts
- **My Tickets** (`/tickets`) - View and manage your NFT tickets
- **My Events** (`/my-events`) - Manage events you created
- **Check-in** (`/check-in/[eventId]`) - Validate tickets at events
- **Rewards** (`/rewards`) - View rewards and achievements

## 🛠️ Development

### Running Tests

```bash
# Frontend linting
bun run lint

# Smart contract tests
cd sticket-contracts
cargo test
```

### Deploying Contracts

See [sticket-contracts/README.md](./sticket-contracts/README.md) for detailed deployment instructions.

```bash
cd sticket-contracts
./deploy.sh
```

## 🤝 Contributing

Contributions are welcome! Please read the [PROJECT_GUIDE.md](./info/PROJECT_GUIDE.md) for development guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet](https://freighter.app/)

## 📄 License

[Add your license here]

---

<p align="center">
  Built with ❤️ on Stellar
</p>
