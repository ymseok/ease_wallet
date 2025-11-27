import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth, clearAuth } from '../services/walletService';
import { getWalletFromPIN } from '../services/signingService';

const Transfer: React.FC = () => {
    const [auth, setAuth] = useState<any>(null);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadAuth();
    }, []);

    const loadAuth = async () => {
        const authData = await getStoredAuth();
        setAuth(authData);
    };

    const handleTransfer = () => {
        if (!recipient || !amount) {
            setError('Please fill in all fields');
            return;
        }

        if (!recipient.startsWith('0x') || recipient.length !== 42) {
            setError('Invalid recipient address');
            return;
        }

        setError('');
        setShowPinModal(true);
    };

    const handleConfirmTransfer = async () => {
        if (pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get wallet from PIN
            const wallet = getWalletFromPIN(auth.user.id, pin);

            // In production, you would:
            // 1. Create UserOperation
            // 2. Sign with wallet
            // 3. Submit to bundler
            // 4. Use paymaster for gas sponsorship

            // For demo, we'll just show success
            setSuccess(`Transfer of ${amount} ETH to ${recipient} initiated!`);
            setShowPinModal(false);
            setRecipient('');
            setAmount('');
            setPin('');

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await clearAuth();
        navigate('/login');
    };

    if (!auth) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="page-container transfer-page">
            <div className="header-bar">
                <div className="user-info">
                    <div className="avatar">{auth.user.name?.[0] || '?'}</div>
                    <div>
                        <div className="user-name">{auth.user.name}</div>
                        <div className="wallet-address">
                            {auth.accountAddress?.slice(0, 6)}...{auth.accountAddress?.slice(-4)}
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={() => navigate('/change-pin')} title="Change PIN">
                        🔑
                    </button>
                    <button className="btn-icon" onClick={handleLogout} title="Logout">
                        🚪
                    </button>
                </div>
            </div>

            <div className="card">
                <h2>Transfer Assets</h2>
                <p className="description">
                    Send assets to another AA wallet. Gas fees can be paid with ERC-20 tokens.
                </p>

                <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Amount (ETH)</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.001"
                    />
                </div>

                <div className="info-box">
                    ⚡ Gas fees sponsored by paymaster (ERC-20)
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button
                    className="btn btn-primary"
                    onClick={handleTransfer}
                    disabled={loading}
                >
                    Transfer
                </button>
            </div>

            {showPinModal && (
                <div className="modal-overlay" onClick={() => !loading && setShowPinModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Transaction</h3>
                        <p>Enter your PIN to sign and send the transaction</p>

                        <div className="form-group">
                            <label>PIN</label>
                            <input
                                type="password"
                                className="pin-input"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="______"
                                maxLength={6}
                                autoFocus
                            />
                            <div className="pin-dots">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className={`dot ${i < pin.length ? 'filled' : ''}`} />
                                ))}
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPinModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirmTransfer}
                                disabled={loading || pin.length !== 6}
                            >
                                {loading ? 'Signing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfer;
