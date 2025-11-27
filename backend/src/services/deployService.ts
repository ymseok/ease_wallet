import { ethers } from 'ethers';
import { getChainConfig, getProvider } from '../config/chains';
import { getWalletFromPIN } from './keyService';

// AccountFactory ABI (simplified)
const ACCOUNT_FACTORY_ABI = [
    'function createAccount(address owner, uint256 salt) returns (address)',
    'function getAddress(address owner, uint256 salt) view returns (address)'
];

/**
 * Calculate deterministic AA account address
 * Same address across all chains if factory is deployed at same address
 */
export async function getAAAddress(
    ownerAddress: string,
    salt: string,
    chainKey: string
): Promise<string> {
    const config = getChainConfig(chainKey);
    const provider = getProvider(chainKey);

    const factory = new ethers.Contract(
        config.accountFactory,
        ACCOUNT_FACTORY_ABI,
        provider
    );

    const saltBytes = ethers.zeroPadValue(ethers.toUtf8Bytes(salt), 32);
    const accountAddress = await factory.getAddress(ownerAddress, saltBytes);

    return accountAddress;
}

/**
 * Deploy AA account on a specific chain
 */
export async function deployAAAccount(
    ownerAddress: string,
    salt: string,
    chainKey: string,
    deployerPrivateKey: string
): Promise<{ address: string; txHash: string }> {
    const config = getChainConfig(chainKey);
    const provider = getProvider(chainKey);
    const deployer = new ethers.Wallet(deployerPrivateKey, provider);

    const factory = new ethers.Contract(
        config.accountFactory,
        ACCOUNT_FACTORY_ABI,
        deployer
    );

    const saltBytes = ethers.zeroPadValue(ethers.toUtf8Bytes(salt), 32);

    // Check if account already exists
    const expectedAddress = await factory.getAddress(ownerAddress, saltBytes);
    const code = await provider.getCode(expectedAddress);

    if (code !== '0x') {
        return {
            address: expectedAddress,
            txHash: 'already-deployed'
        };
    }

    // Deploy account
    const tx = await factory.createAccount(ownerAddress, saltBytes);
    const receipt = await tx.wait();

    return {
        address: expectedAddress,
        txHash: receipt.hash
    };
}

/**
 * Deploy AA account on multiple chains
 */
export async function deployMultiChainAccount(
    socialId: string,
    pin: string,
    chainKeys: string[],
    deployerPrivateKey: string
): Promise<{
    ownerAddress: string;
    accountAddress: string;
    deployments: Array<{ chain: string; txHash: string; address: string }>;
}> {
    // Get owner wallet from PIN
    const ownerWallet = getWalletFromPIN(socialId, pin);
    const ownerAddress = ownerWallet.address;

    // Use social ID as salt for deterministic address
    const salt = socialId;

    // Deploy on all chains
    const deployments = [];
    let accountAddress = '';

    for (const chainKey of chainKeys) {
        try {
            const result = await deployAAAccount(
                ownerAddress,
                salt,
                chainKey,
                deployerPrivateKey
            );

            // First deployment sets the account address (should be same for all)
            if (!accountAddress) {
                accountAddress = result.address;
            }

            deployments.push({
                chain: chainKey,
                txHash: result.txHash,
                address: result.address
            });
        } catch (error: any) {
            console.error(`Failed to deploy on ${chainKey}:`, error.message);
            deployments.push({
                chain: chainKey,
                txHash: 'failed',
                address: ''
            });
        }
    }

    return {
        ownerAddress,
        accountAddress,
        deployments
    };
}

/**
 * Check if AA account is deployed on a chain
 */
export async function isAccountDeployed(
    accountAddress: string,
    chainKey: string
): Promise<boolean> {
    const provider = getProvider(chainKey);
    const code = await provider.getCode(accountAddress);
    return code !== '0x';
}
