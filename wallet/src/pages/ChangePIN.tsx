import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth, storeAuth, recoverPIN } from '../services/walletService';

const ChangePIN: React.FC = () => {
    const [auth, setAuth] = useState<any>(null);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
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

    const handlePINChange = (value: string, field: 'current' | 'new' | 'confirm') => {
        const digits = value.replace(/\D/g, '').slice(0, 6);
        if (field === 'current') setCurrentPin(digits);
        else if (field === 'new') setNewPin(digits);
        else setConfirmPin(digits);
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (currentPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6) {
            setError('All PINs must be 6 digits');
            return;
        }

        if (currentPin !== auth.pin) {
            setError('Current PIN is incorrect');
            return;
        }

        if (newPin !== confirmPin) {
            setError('New PINs do not match');
            return;
        }

        if (currentPin === newPin) {
            setError('New PIN must be different from current PIN');
            return;
        }

        setLoading(true);

        try {
            // Call backend to recover/change PIN
            await recoverPIN(auth.token, newPin);

            // Update stored auth with new PIN
            await storeAuth({
                ...auth,
                pin: newPin
            });

            setSuccess('PIN changed successfully!');
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');

            // Navigate back to transfer after 2 seconds
            setTimeout(() => {
                navigate('/transfer');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!auth) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="page-container change-pin-page">
            <div className="header">
                <button className="btn-back" onClick={() => navigate('/transfer')}>
                    ← Back
                </button>
                <h1>Change PIN</h1>
            </div>

            <div className="card">
                <h2>Update Your PIN</h2>
                <p className="description">
                    Change your 6-digit PIN. This will update the signing key for your wallet.
                </p>

                <div className="form-group">
                    <label>Current PIN</label>
                    <input
                        type="password"
                        className="pin-input"
                        value={currentPin}
                        onChange={(e) => handlePINChange(e.target.value, 'current')}
                        placeholder="______"
                        maxLength={6}
                    />
                    <div className="pin-dots">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`dot ${i < currentPin.length ? 'filled' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>New PIN</label>
                    <input
                        type="password"
                        className="pin-input"
                        value={newPin}
                        onChange={(e) => handlePINChange(e.target.value, 'new')}
                        placeholder="______"
                        maxLength={6}
                    />
                    <div className="pin-dots">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`dot ${i < newPin.length ? 'filled' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Confirm New PIN</label>
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
                {success && <div className="success-message">{success}</div>}

                <div className="warning-box">
                    ⚠️ Changing your PIN will generate a new signing key. Make sure to remember it!
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading || currentPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6}
                >
                    {loading ? 'Updating...' : 'Change PIN'}
                </button>
            </div>
        </div>
    );
};

export default ChangePIN;
