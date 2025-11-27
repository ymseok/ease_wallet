import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import NetworkSelection from '../pages/NetworkSelection';
import Transfer from '../pages/Transfer';
import ChangePIN from '../pages/ChangePIN';
import { getStoredAuth } from '../services/walletService';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasWallet, setHasWallet] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const auth = await getStoredAuth();
        setIsAuthenticated(!!auth);
        setHasWallet(!!auth?.accountAddress);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/login" element={<Login onLogin={checkAuth} />} />
                    <Route
                        path="/network-selection"
                        element={
                            isAuthenticated ? <NetworkSelection onComplete={checkAuth} /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/transfer"
                        element={
                            isAuthenticated && hasWallet ? <Transfer /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/change-pin"
                        element={
                            isAuthenticated && hasWallet ? <ChangePIN /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" />
                            ) : !hasWallet ? (
                                <Navigate to="/network-selection" />
                            ) : (
                                <Navigate to="/transfer" />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
