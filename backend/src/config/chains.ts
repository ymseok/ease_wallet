import { ethers } from 'ethers';

export interface ChainConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    entryPoint: string;
    accountFactory: string;
    paymaster: string;
    testERC20: string;
    explorer: string;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
    sepolia: {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
        entryPoint: process.env.SEPOLIA_ENTRYPOINT || '',
        accountFactory: process.env.SEPOLIA_FACTORY || '',
        paymaster: process.env.SEPOLIA_PAYMASTER || '',
        testERC20: process.env.SEPOLIA_ERC20 || '',
        explorer: 'https://sepolia.etherscan.io'
    },
    baseSepolia: {
        chainId: 84532,
        name: 'Base Sepolia',
        rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
        entryPoint: process.env.BASE_SEPOLIA_ENTRYPOINT || '',
        accountFactory: process.env.BASE_SEPOLIA_FACTORY || '',
        paymaster: process.env.BASE_SEPOLIA_PAYMASTER || '',
        testERC20: process.env.BASE_SEPOLIA_ERC20 || '',
        explorer: 'https://sepolia.basescan.org'
    },
    arbitrumSepolia: {
        chainId: 421614,
        name: 'Arbitrum Sepolia',
        rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
        entryPoint: process.env.ARBITRUM_SEPOLIA_ENTRYPOINT || '',
        accountFactory: process.env.ARBITRUM_SEPOLIA_FACTORY || '',
        paymaster: process.env.ARBITRUM_SEPOLIA_PAYMASTER || '',
        testERC20: process.env.ARBITRUM_SEPOLIA_ERC20 || '',
        explorer: 'https://sepolia.arbiscan.io'
    },
    optimismSepolia: {
        chainId: 11155420,
        name: 'Optimism Sepolia',
        rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
        entryPoint: process.env.OPTIMISM_SEPOLIA_ENTRYPOINT || '',
        accountFactory: process.env.OPTIMISM_SEPOLIA_FACTORY || '',
        paymaster: process.env.OPTIMISM_SEPOLIA_PAYMASTER || '',
        testERC20: process.env.OPTIMISM_SEPOLIA_ERC20 || '',
        explorer: 'https://sepolia-optimistic.etherscan.io'
    }
};

export function getChainConfig(chainKey: string): ChainConfig {
    const config = SUPPORTED_CHAINS[chainKey];
    if (!config) {
        throw new Error(`Unsupported chain: ${chainKey}`);
    }
    return config;
}

export function getProvider(chainKey: string): ethers.JsonRpcProvider {
    const config = getChainConfig(chainKey);
    return new ethers.JsonRpcProvider(config.rpcUrl);
}

export function getAllChainKeys(): string[] {
    return Object.keys(SUPPORTED_CHAINS);
}
