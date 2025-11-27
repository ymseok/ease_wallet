import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAuth } from '../services/walletService';

const BACKEND_URL = 'http://localhost:3000';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        // Open Google OAuth in new window
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const authWindow = window.open(
            `${BACKEND_URL}/auth/google`,
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth callback
        window.addEventListener('message', async (event) => {
            if (event.data.type === 'OAUTH_SUCCESS') {
                authWindow?.close();

                // Store user data temporarily
                const userData = {
                    token: event.data.token,
                    user: event.data.user
                };

                await storeAuth(userData);
                setLoading(false);
                onLogin();
                navigate('/network-selection');
            }
        });

        setLoading(true);
    };

    const handlePINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPin(value);
    };

    return (
        <div className="page-container login-page">
            <div className="logo-container">
                <div className="logo">🔐</div>
                <h1>Ease Wallet</h1>
                <p className="subtitle">Account Abstraction Wallet</p>
            </div>

            <div className="card">
                <h2>Welcome!</h2>
                <p className="description">
                    Sign in with your social account to access your multi-chain wallet
                </p>

                <button
                    className="btn btn-primary btn-google"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : '🌐 Sign in with Google'}
                </button>

                {error && <div className="error-message">{error}</div>}
            </div>

            <div className="footer">
                <p>Secured by Account Abstraction (ERC-4337)</p>
            </div>
        </div>
    );
};

export default Login;
