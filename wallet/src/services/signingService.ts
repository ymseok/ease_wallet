import { ethers } from 'ethers';
import * as crypto from 'crypto-browserify';

/**
 * Generate deterministic private key from social ID and PIN
 * Must match backend implementation
 */
export function generatePrivateKey(socialId: string, pin: string): string {
    const salt = `ease-wallet-${socialId}`;
    const iterations = 100000;
    const keyLength = 32;

    // Use Web Crypto API or fallback
    const derivedKey = crypto.pbkdf2Sync(
        pin,
        salt,
        iterations,
        keyLength,
        'sha256'
    );

    return `0x${derivedKey.toString('hex')}`;
}

/**
 * Get wallet from social ID and PIN
 */
export function getWalletFromPIN(socialId: string, pin: string): ethers.Wallet {
    const privateKey = generatePrivateKey(socialId, pin);
    return new ethers.Wallet(privateKey);
}

/**
 * Sign a message with PIN-derived wallet
 */
export async function signMessage(
    socialId: string,
    pin: string,
    message: string
): Promise<string> {
    const wallet = getWalletFromPIN(socialId, pin);
    return wallet.signMessage(message);
}

/**
 * Sign a transaction with PIN-derived wallet
 */
export async function signTransaction(
    socialId: string,
    pin: string,
    transaction: ethers.TransactionRequest
): Promise<string> {
    const wallet = getWalletFromPIN(socialId, pin);
    return wallet.signTransaction(transaction);
}
