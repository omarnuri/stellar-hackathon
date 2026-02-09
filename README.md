# 🎫 Sticket - Web3 NFT Ticketing Platform

A decentralized event ticketing platform built on **Stellar** that transforms tickets into Non-Fungible Tokens (NFTs). Built with Next.js, TypeScript, and Soroban smart contracts.

## 🌐 Live Demo

**🔗 [View Live Application](https://stellar-hackathon-85lb.vercel.app)**

---

## 🚀 Hackathon Experience & My Contribution

**Built in 48 hours. No sleep, pure code.**

I was a core developer in the team that built this Web3 Ticketing Platform during the **Stellar Hackathon**.

### 👨‍💻 My Role
* **Gamification Logic:** Designed and implemented user engagement mechanics and reward systems.
* **Frontend Architecture:** Built key UI components using Next.js 15 & Tailwind CSS with a "Retro Tech" aesthetic.
* **Web3 Integration:** Connected frontend logic with Stellar blockchain smart contracts for real-time NFT ticketing.

### 📸 Presentation
<p align="center">
  <img src="A5713T01.jpg" width="45%" alt="Hackathon coding process" style="border-radius: 10px; margin-right: 10px;">
  <img src="B5235T01 (2).jpg" width="45%" alt="Hackathon team" style="border-radius: 10px;">
</p>

> *"Coding for 48 hours straight taught me more about deadlines, Web3, and teamwork than a whole semester."*

---

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
Environment Setup
```


Create a .env.local file in the root directory:


```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_FACTORY_CONTRACT_ID=your_factory_contract_id
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
```
Open http://localhost:3000 in your browser.

```bash
# Build for production
bun run build
# or
npm run build
```

🏗️ Tech Stack
Frontend
Framework: Next.js 15.5.6 (App Router)

Language: TypeScript

Styling: Tailwind CSS v4

UI Components: Radix UI + shadcn/ui

3D Graphics: Three.js + React Three Fiber

Forms: React Hook Form + Zod

State Management: TanStack Query (React Query)

Animations: GSAP

Blockchain
Network: Stellar (Soroban smart contracts)

Wallet: Freighter

SDK: @stellar/stellar-sdk, @stellar/freighter-api

Storage: IPFS via Pinata

Smart Contracts
Language: Rust

Platform: Soroban (Stellar)

Contracts: Factory pattern for event deployment, NFT collections for tickets

🤝 Contributing
Contributions are welcome!

Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

<p align="center"> Built with ❤️ on Stellar </p>


