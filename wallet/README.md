# Ease Wallet - Chrome Extension

Chrome extension wallet powered by Account Abstraction (ERC-4337).

## Features

- 🔐 Social login (Google OAuth)
- 🔑 PIN-based wallet security  
- 🌐 Multi-chain support (Ethereum, Base, Arbitrum, Optimism)
- 🎯 Deterministic addresses across chains
- ⛽ Gas sponsorship with ERC-20 tokens
- 🔄 PIN recovery mechanism

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build extension:
   ```bash
   npm run build
   ```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

4. Development mode (watch):
   ```bash
   npm run dev
   ```

## Project Structure

```
wallet/
├── src/
│   ├── background.ts          # Service worker
│   ├── popup/
│   │   ├── index.html         # Popup HTML
│   │   ├── index.tsx          # React entry
│   │   ├── App.tsx            # Main app component
│   │   └── styles.css         # Styles
│   ├── pages/
│   │   ├── Login.tsx          # Google OAuth login
│   │   ├── NetworkSelection.tsx  # Chain selection
│   │   ├── Transfer.tsx       # Asset transfer
│   │   └── ChangePIN.tsx      # PIN management
│   └── services/
│       ├── walletService.ts   # Storage & API
│       └── signingService.ts  # PIN-based signing
├── manifest.json
├── package.json
└── webpack.config.js
```

## Configuration

Make sure the backend server is running on `http://localhost:3000`.

Update `BACKEND_URL` in `src/services/walletService.ts` if needed.

## Usage

1. Click extension icon
2. Sign in with Google
3. Create 6-digit PIN
4. Select blockchain networks
5. Deploy wallet (same address on all chains!)
6. Transfer assets with gas sponsorship

## Security

- PIN never stored directly
- Deterministic key derivation (PBKDF2)
- Encrypted recovery data
- Social login for account recovery
