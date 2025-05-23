# Ethereum Lottery System

A decentralized lottery system built on the Ethereum blockchain where participants can enter by purchasing tickets and winners are selected randomly using a verifiable random function.

## Features

- Decentralized lottery management
- Fair and transparent random selection
- Smart contract-based ticket purchases
- Automatic prize distribution
- Admin controls for lottery management
- Responsive React frontend
- Real-time lottery status updates
- Wallet integration with Web3Modal
- User-friendly ticket purchase interface

## Prerequisites

- Node.js (v14.0.0 or later)
- Hardhat
- MetaMask wallet
- Ethereum testnet (Sepolia/Goerli) for testing
- React.js 18+
- Ethers.js
- Web3Modal
- TailwindCSS

## Tech Stack

### Frontend
- React.js - Web framework
- TailwindCSS - Styling
- Ethers.js - Blockchain interactions
- Web3Modal - Wallet connections
- React Query - Data fetching
- Vite - Build tool

### Backend
- Hardhat - Development environment
- Solidity - Smart contracts

## Setup

1. Clone the repository
```bash
git clone https://github.com/Bilawal-2/eth-lottery-system.git
cd eth-lottery-system
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Frontend Development

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Configure environment variables:
```bash
cd frontend
cp .env.example .env.local
# Add your contract addresses and RPC endpoints
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Frontend Features

- Connect wallet functionality
- Real-time lottery status display
- Ticket purchase interface
- Winner history
- Admin panel (for lottery manager)
- Transaction notifications

## Smart Contracts

The lottery system consists of the following main contract:
- `Lottery.sol`: Core lottery logic with built-in random number generation

## Usage

1. Deploy contracts
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

2. Start the frontend
```bash
npm run start
```

## Deployment

### Smart Contracts
1. Deploy to Ganache:
```bash
# Start Ganache and note the RPC URL (default: http://127.0.0.1:7545)
npx hardhat run scripts/deploy.js --network localhost
# Copy the deployed address to .env.local NEXT_PUBLIC_LOTTERY_ADDRESS_GANACHE
```

2. Verify deployment:
```bash
# Check contract code
npx hardhat verify --network ganache DEPLOYED_CONTRACT_ADDRESS
```

### Frontend
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to your preferred hosting service:
```bash
# Example for Vercel
vercel deploy
```

## Testing

Run the test suite:
```bash
npx hardhat test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Security

- Smart contracts are audited for security vulnerabilities
- Admin functions are protected with OpenZeppelin's Ownable

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
