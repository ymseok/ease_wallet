const BACKEND_URL = 'http://localhost:3000';

export interface AuthData {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
    accountAddress?: string;
    ownerAddress?: string;
    pin?: string;
}

/**
 * Get stored authentication data from Chrome storage
 */
export async function getStoredAuth(): Promise<AuthData | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['auth'], (result) => {
            resolve(result.auth || null);
        });
    });
}

/**
 * Store authentication data in Chrome storage
 */
export async function storeAuth(auth: AuthData): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ auth }, () => {
            resolve();
        });
    });
}

/**
 * Clear authentication data
 */
export async function clearAuth(): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.remove(['auth'], () => {
            resolve();
        });
    });
}

/**
 * Deploy AA wallet on selected chains
 */
export async function deployWallet(
    token: string,
    pin: string,
    chains: string[]
): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/wallet/deploy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin, chains })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment failed');
    }

    return response.json();
}

/**
 * Get available chains
 */
export async function getChains(): Promise<string[]> {
    const response = await fetch(`${BACKEND_URL}/wallet/chains`);
    const data = await response.json();
    return data.chains;
}

/**
 * Recover PIN
 */
export async function recoverPIN(
    token: string,
    newPin: string
): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/wallet/recover-pin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPin })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'PIN recovery failed');
    }

    return response.json();
}
