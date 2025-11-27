# Ease Wallet Backend

Backend service for Ease Wallet - AA (Abstract Account) based wallet with social login and multi-chain support.

## Features

- 🔐 Google OAuth 2.0 social login
- 🔑 PIN-based wallet key derivation
- 🌐 Multi-chain AA account deployment
- 🔄 Deterministic address generation across chains
- 💾 PIN recovery mechanism
- ⛽ Gas sponsorship integration

## Setup

> 💡 **Package Manager Note**: This project recommends **pnpm** for best dependency resolution.  
> See [PACKAGE_MANAGER.md](./PACKAGE_MANAGER.md) for detailed comparison and setup.

1. Install dependencies:
   ```bash
   # Recommended: pnpm
   pnpm install

   # Alternative: yarn
   yarn install
   
   # Not recommended: npm (use --legacy-peer-deps)
   npm install --legacy-peer-deps
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure `.env` file:
   - Add Google OAuth credentials
   - Set deployer private key
   - Configure RPC URLs
   - Set encryption keys

4. Run in development:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/verify` - Verify JWT token

### Wallet

- `POST /wallet/deploy` - Deploy AA account on selected chains
- `GET /wallet/address` - Get user's AA address
- `POST /wallet/recover-pin` - Recover/reset PIN
- `GET /wallet/chains` - List supported chains

### Health

- `GET /health` - Health check
- `GET /` - API info

## Architecture

- **Key Derivation**: Uses PBKDF2 to generate deterministic private keys from social ID + PIN
- **Multi-Chain**: Deploys same AA address across multiple chains using CREATE2
- **Security**: PIN never stored, only used for key derivation
- **Recovery**: Encrypted backup key for PIN recovery

## Environment Variables

See `.env.example` for all required environment variables.

## Development

```bash
# pnpm (recommended)
pnpm dev        # Development server with hot reload
pnpm build      # Build TypeScript
pnpm lint       # Lint code
pnpm test       # Run tests

# yarn
yarn dev
yarn build
yarn lint
yarn test

# npm
npm run dev
npm run build
npm run lint
npm test
```
