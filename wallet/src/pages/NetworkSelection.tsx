import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth, storeAuth, deployWallet, getChains } from '../services/walletService';

const NetworkSelection: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [availableChains, setAvailableChains] = useState<string[]>([]);
    const [selectedChains, setSelectedChains] = useState<string[]>([]);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'chains' | 'pin'>('chains');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadChains();
    }, []);

    const loadChains = async () => {
        try {
            const chains = await getChains();
            setAvailableChains(chains);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleChainToggle = (chain: string) => {
        setSelectedChains(prev =>
            prev.includes(chain)
                ? prev.filter(c => c !== chain)
                : [...prev, chain]
        );
    };

    const handleContinue = () => {
        if (selectedChains.length === 0) {
            setError('Please select at least one network');
            return;
        }
        setError('');
        setStep('pin');
    };

    const handlePINChange = (value: string, field: 'pin' | 'confirm') => {
        const digits = value.replace(/\D/g, '').slice(0, 6);
        if (field === 'pin') {
            setPin(digits);
        } else {
            setConfirmPin(digits);
        }
    };

    const handleDeploy = async () => {
        if (pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const auth = await getStoredAuth();
            if (!auth) throw new Error('Not authenticated');

            const result = await deployWallet(auth.token, pin, selectedChains);

            // Update stored auth with wallet data
            await storeAuth({
                ...auth,
                accountAddress: result.accountAddress,
                ownerAddress: result.ownerAddress,
                pin: pin // In production, don't store PIN directly
            });

            onComplete();
            navigate('/transfer');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const chainNames: Record<string, string> = {
        sepolia: 'Ethereum Sepolia',
        baseSepolia: 'Base Sepolia',
        arbitrumSepolia: 'Arbitrum Sepolia',
        optimismSepolia: 'Optimism Sepolia'
    };

    return (
        <div className="page-container network-selection-page">
            <div className="header">
                <h1>Setup Your Wallet</h1>
                <p className="step-indicator">
                    Step {step === 'chains' ? '1' : '2'} of 2
                </p>
            </div>

            {step === 'chains' ? (
                <div className="card">
                    <h2>Select Networks</h2>
                    <p className="description">
                        Choose which blockchain networks you want to use. Your wallet will have the same address on all selected networks.
                    </p>

                    <div className="chain-list">
                        {availableChains.map(chain => (
                            <div
                                key={chain}
                                className={`chain-item ${selectedChains.includes(chain) ? 'selected' : ''}`}
                                onClick={() => handleChainToggle(chain)}
                            >
                                <div className="chain-info">
                                    <div className="chain-icon">⛓️</div>
                                    <div className="chain-name">{chainNames[chain] || chain}</div>
                                </div>
                                <div className="checkbox">
                                    {selectedChains.includes(chain) ? '✓' : ''}
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        className="btn btn-primary"
                        onClick={handleContinue}
                        disabled={selectedChains.length === 0}
                    >
                        Continue
                    </button>
                </div>
            ) : (
                <div className="card">
                    <h2>Create Your PIN</h2>
                    <p className="description">
                        Create a 6-digit PIN to secure your wallet. You'll use this to sign transactions.
                    </p>

                    <div className="form-group">
                        <label>Enter PIN</label>
                        <input
                            type="password"
                            className="pin-input"
                            value={pin}
                            onChange={(e) => handlePINChange(e.target.value, 'pin')}
                            placeholder="______"
                            maxLength={6}
                        />
                        <div className="pin-dots">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={`dot ${i < pin.length ? 'filled' : ''}`} />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm PIN</label>
                        <input
                            type="password"
                            className="pin-input"
                            value={confirmPin}
                            onChange={(e) => handlePINChange(e.target.value, 'confirm')}
                            placeholder="______"
                            maxLength={6}
                        />
                        <div className="pin-dots">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={`dot ${i < confirmPin.length ? 'filled' : ''}`} />
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="button-group">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setStep('chains')}
                            disabled={loading}
                        >
                            Back
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleDeploy}
                            disabled={loading || pin.length !== 6 || pin !== confirmPin}
                        >
                            {loading ? 'Deploying...' : 'Deploy Wallet'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkSelection;
