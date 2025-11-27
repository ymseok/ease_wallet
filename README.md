# Ease Wallet

Account Abstraction (ERC-4337) wallet as a Chrome extension with social login and multi-chain support.

## Features

- ✅ **Social Login**: Google OAuth authentication
- ✅ **PIN Security**: 6-digit PIN for transaction signing
- ✅ **Multi-Chain**: Deploy same wallet address across multiple networks
- ✅ **Gas Sponsorship**: Pay transaction fees with ERC-20 tokens
- ✅ **PIN Recovery**: Recover access using social login
- ✅ **Deterministic Addresses**: Same address on all chains using CREATE2

## Project Structure

```
ease_wallet/
├── backend/           # Node.js/Express backend service
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── config/chains.ts   # Chain configurations
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   └── package.json
├── contracts/         # Foundry smart contracts
│   ├── src/
│   │   ├── EntryPoint.sol     # ERC-4337 EntryPoint
│   │   ├── AccountFactory.sol # CREATE2 factory
│   │   ├── SimpleAccount.sol  # AA wallet implementation
│   │   └── Paymaster.sol      # Gas sponsorship
│   └── script/
│       └── MultiChainDeploy.s.sol
└── wallet/           # Chrome extension
    ├── src/
    │   ├── background.ts      # Service worker
    │   ├── popup/             # React UI
    │   ├── pages/             # Page components
    │   └── services/          # Utilities
    └── manifest.json
```

## Quick Start

### 1. Deploy Smart Contracts

```bash
cd contracts

# Copy environment file
cp .env.example .env

# Edit .env with your private key and RPC URLs
# Add: PRIVATE_KEY, SEPOLIA_RPC_URL, etc.

# Deploy to multiple chains
./deploy-multi-chain.sh

# Or deploy to a single chain
forge script script/SepoliaDeploy.s.sol:SepoliaDeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast
```

**Copy the deployed contract addresses** from the output.

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with:
# - Google OAuth credentials (from Google Cloud Console)
# - Deployed contract addresses (from step 1)
# - RPC URLs
# - Encryption keys

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`.

### 3. Build Chrome Extension

```bash
cd wallet

# Install dependencies
npm install

# Build extension
npm run build
```

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `wallet/dist/` folder
5. Extension icon will appear in Chrome toolbar

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `backend/.env`

## Architecture

### Account Abstraction Flow

1. **Social Login**: User authenticates with Google OAuth
2. **PIN Setup**: User creates 6-digit PIN
3. **Key Derivation**: Private key derived from social ID + PIN using PBKDF2
4. **Multi-Chain Deployment**: Same AA address deployed across selected chains
5. **Transaction Signing**: PIN re-deriveskey to sign UserOperations
6. **Gas Sponsorship**: Paymaster accepts ERC-20 for gas payment

### Multi-Chain Deterministic Addresses

```
AccountFactory.createAccount(owner, salt)
  ↓
CREATE2(owner, salt) → Same address on all chains
```

**Requirements**:
- EntryPoint, AccountFactory deployed at same addresses on all chains
- Same owner address (derived from social ID + PIN)
- Same salt (user's social ID)

### PIN Recovery

1. User authenticates with social login
2. Backend decrypts recovery key
3. User sets new PIN
4. Backend generates new private key
5. AA account owner updated via `changeOwner()` transaction

## Development

### Backend Development

```bash
cd backend
npm run dev    # Start with hot reload
npm run build  # Build TypeScript
npm test       # Run tests
```

### Contract Development

```bash
cd contracts
forge build    # Compile contracts
forge test     # Run tests
forge test -vvv # Verbose test output
```

### Extension Development

```bash
cd wallet
npm run dev    # Watch mode (rebuild on changes)
npm run build  # Production build
```

After rebuilding, click the refresh icon on `chrome://extensions/` to reload the extension.

## Supported Networks

- Ethereum Sepolia
- Base Sepolia
- Arbitrum Sepolia
- Optimism Sepolia

Add more chains in `backend/src/config/chains.ts`.

## Security Considerations

⚠️ **This is a demonstration project.** For production use:

1. **PIN Storage**: Don't store PIN in Chrome storage (used here for demo)
2. **Key Management**: Use hardware security module or secure enclave
3. **Backend Security**: Implement rate limiting, proper session management
4. **Encryption**: Use stronger encryption for recovery data
5. **Audit**: Have smart contracts audited
6. **HTTPS**: Use HTTPS for backend in production
7. **OAuth Scopes**: Limit Google OAuth scopes to minimum required

## Troubleshooting

### Contract deployment fails
- Check deployer has sufficient ETH on the target network
- Verify RPC URL is correct and accessible
- Try with `--legacy` flag for older chains

### Backend auth errors
- Verify Google OAuth credentials are correct
- Check redirect URL matches exactly
- Ensure backend is running on correct port

### Extension not loading
- Check console for webpack errors
- Rebuild extension: `npm run build`
- Verify all dependencies installed
- Check manifest.json syntax

### PIN doesn't work
- PIN derivation must match between frontend and backend
- Check PBKDF2 parameters are identical
- Verify social ID is consistent

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
