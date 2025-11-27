import { Request, Response, Router } from 'express';
import { validatePIN, generateRecoveryData, decryptRecoveryData } from '../services/keyService';
import { deployMultiChainAccount, getAAAddress, isAccountDeployed } from '../services/deployService';
import { getAllChainKeys } from '../config/chains';
import jwt from 'jsonwebtoken';

const router = Router();

// Simple in-memory storage for recovery data (in production, use a database)
const recoveryStorage = new Map<string, { encryptedKey: string; recoveryHint: string }>();

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req: Request, res: Response, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        (req as any).user = user;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
}

/**
 * POST /wallet/deploy
 * Deploy AA account on selected chains
 */
router.post('/deploy', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { pin, chains } = req.body;
        const user = (req as any).user;

        if (!pin || !validatePIN(pin)) {
            return res.status(400).json({ error: 'Invalid PIN format. Must be 6 digits.' });
        }

        if (!chains || !Array.isArray(chains) || chains.length === 0) {
            return res.status(400).json({ error: 'At least one chain must be selected' });
        }

        // Validate chain keys
        const validChains = getAllChainKeys();
        const invalidChains = chains.filter((c: string) => !validChains.includes(c));
        if (invalidChains.length > 0) {
            return res.status(400).json({ error: `Invalid chains: ${invalidChains.join(', ')}` });
        }

        const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
        if (!deployerPrivateKey) {
            return res.status(500).json({ error: 'Server configuration error: deployer key not set' });
        }

        // Deploy multi-chain account
        const result = await deployMultiChainAccount(
            user.id,
            pin,
            chains,
            deployerPrivateKey
        );

        // Generate and store recovery data
        const recoveryData = generateRecoveryData(user.id, pin);
        recoveryStorage.set(user.id, recoveryData);

        res.json({
            success: true,
            ownerAddress: result.ownerAddress,
            accountAddress: result.accountAddress,
            deployments: result.deployments,
            recoveryHint: recoveryData.recoveryHint
        });
    } catch (error: any) {
        console.error('Deployment error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /wallet/address
 * Get user's AA wallet address
 */
router.get('/address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { chain } = req.query;

        if (!chain || typeof chain !== 'string') {
            return res.status(400).json({ error: 'Chain parameter required' });
        }

        // For demo, we'll use a dummy PIN to calculate address
        // In production, this would come from the user's stored data
        const dummyPIN = '000000'; // This is just for address calculation

        const address = await getAAAddress(user.id, user.id, chain);
        const deployed = await isAccountDeployed(address, chain);

        res.json({
            address,
            deployed,
            chain
        });
    } catch (error: any) {
        console.error('Address lookup error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /wallet/recover-pin
 * Initiate PIN recovery process
 */
router.post('/recover-pin', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { newPin } = req.body;

        if (!newPin || !validatePIN(newPin)) {
            return res.status(400).json({ error: 'Invalid PIN format. Must be 6 digits.' });
        }

        // Check if recovery data exists
        const recoveryData = recoveryStorage.get(user.id);
        if (!recoveryData) {
            return res.status(404).json({ error: 'No recovery data found. Please contact support.' });
        }

        // In production, you would:
        // 1. Decrypt the old private key
        // 2. Generate new private key with new PIN
        // 3. Update AA account owner (requires transaction)
        // 4. Store new recovery data

        // For now, we'll generate new recovery data
        const newRecoveryData = generateRecoveryData(user.id, newPin);
        recoveryStorage.set(user.id, newRecoveryData);

        res.json({
            success: true,
            message: 'PIN recovered successfully',
            recoveryHint: newRecoveryData.recoveryHint,
            note: 'In production, this would also update the AA account owner'
        });
    } catch (error: any) {
        console.error('PIN recovery error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /wallet/chains
 * Get list of supported chains
 */
router.get('/chains', (req: Request, res: Response) => {
    const chains = getAllChainKeys();
    res.json({ chains });
});

export default router;
