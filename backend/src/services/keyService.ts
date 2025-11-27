import { ethers } from 'ethers';
import * as crypto from 'crypto';
import CryptoJS from 'crypto-js';

/**
 * Generate a deterministic private key from social ID and PIN
 * Uses PBKDF2 for key derivation
 */
export function generatePrivateKey(socialId: string, pin: string): string {
    const salt = `ease-wallet-${socialId}`;
    const iterations = 100000;
    const keyLength = 32; // 256 bits

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
 * Generate recovery data for PIN recovery
 * Encrypts the private key with a recovery key
 */
export function generateRecoveryData(
    socialId: string,
    pin: string
): { encryptedKey: string; recoveryHint: string } {
    const privateKey = generatePrivateKey(socialId, pin);
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-me';

    // Encrypt private key
    const encryptedKey = CryptoJS.AES.encrypt(privateKey, encryptionKey).toString();

    // Generate a hint from first and last digits of PIN
    const recoveryHint = `${pin[0]}****${pin[pin.length - 1]}`;

    return { encryptedKey, recoveryHint };
}

/**
 * Decrypt recovery data to get private key
 */
export function decryptRecoveryData(encryptedKey: string): string {
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-me';
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Validate PIN format (6 digits)
 */
export function validatePIN(pin: string): boolean {
    return /^\d{6}$/.test(pin);
}

/**
 * Hash PIN for storage (if needed)
 */
export function hashPIN(pin: string): string {
    return crypto.createHash('sha256').update(pin).digest('hex');
}
