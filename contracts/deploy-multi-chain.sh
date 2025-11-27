#!/bin/bash

# Multi-chain deployment helper script
# Deploys contracts to all specified chains

echo "🚀 Multi-Chain AA Wallet Deployment"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with PRIVATE_KEY and RPC URLs"
    exit 1
fi

# Source environment variables
source .env

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env"
    exit 1
fi

# Define chains to deploy to
declare -A CHAINS
CHAINS[sepolia]=$SEPOLIA_RPC_URL
CHAINS[baseSepolia]=$BASE_SEPOLIA_RPC_URL
CHAINS[arbitrumSepolia]=$ARBITRUM_SEPOLIA_RPC_URL
CHAINS[optimismSepolia]=$OPTIMISM_SEPOLIA_RPC_URL

echo "Chains to deploy:"
for chain in "${!CHAINS[@]}"; do
    echo "  - $chain: ${CHAINS[$chain]}"
done
echo ""

# Deploy to each chain
for chain in "${!CHAINS[@]}"; do
    rpc_url=${CHAINS[$chain]}
    
    if [ -z "$rpc_url" ]; then
        echo "⚠️  Skipping $chain (no RPC URL configured)"
        continue
    fi
    
    echo "📡 Deploying to $chain..."
    echo "   RPC: $rpc_url"
    
    CHAIN_NAME=$chain forge script script/MultiChainDeploy.s.sol:MultiChainDeployScript \
        --rpc-url "$rpc_url" \
        --broadcast \
        --legacy \
        -vvv
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully deployed to $chain"
    else
        echo "❌ Failed to deploy to $chain"
    fi
    
    echo ""
    echo "-----------------------------------"
    echo ""
done

echo "🎉 Multi-chain deployment complete!"
echo ""
echo "Next steps:"
echo "1. Copy the contract addresses to backend/.env"
echo "2. Update backend/src/config/chains.ts if needed"
echo "3. Test deployment with: npm run dev (in backend/)"
