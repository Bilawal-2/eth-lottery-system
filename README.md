# Ethereum Lottery System

A decentralized lottery system built on the Ethereum blockchain where participants can enter by purchasing tickets and winners are selected randomly using a verifiable random function.

## Features

- Decentralized lottery management
- Fair and transparent random selection
- Smart contract-based ticket purchases
- Automatic prize distribution
- Admin controls for lottery management

## Prerequisites

- Node.js (v14.0.0 or later)
- Hardhat
- MetaMask wallet
- Ethereum testnet (Sepolia/Goerli) for testing

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/eth-lottery-system.git
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

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Security

- Smart contracts are audited for security vulnerabilities
- Admin functions are protected with OpenZeppelin's Ownable

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
