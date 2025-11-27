import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for Chrome extension
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow Chrome extension origins
            if (
                !origin ||
                origin.startsWith('chrome-extension://') ||
                origin === 'http://localhost:3000' ||
                origin === process.env.FRONTEND_URL
            ) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    })
);

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'ease-wallet-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'Ease Wallet Backend',
        version: '1.0.0',
        description: 'Backend service for AA Wallet',
        endpoints: {
            auth: '/auth',
            wallet: '/wallet',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ease Wallet Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
