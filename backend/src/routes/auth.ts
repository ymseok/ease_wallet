import { Request, Response, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = Router();

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
        },
        (accessToken, refreshToken, profile, done) => {
            // Return user profile
            return done(null, profile);
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

/**
 * GET /auth/google
 * Initiates Google OAuth flow
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

/**
 * GET /auth/google/callback
 * Google OAuth callback
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/error' }),
    (req: Request, res: Response) => {
        const user = req.user as any;

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.emails?.[0]?.value,
                name: user.displayName
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        // For Chrome extension, we need to redirect with token
        // Extension will capture this
        res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
        </head>
        <body>
          <script>
            // Send message to extension
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              token: '${token}',
              user: ${JSON.stringify({
            id: user.id,
            email: user.emails?.[0]?.value,
            name: user.displayName
        })}
            }, '*');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `);
    }
);

/**
 * GET /auth/error
 * OAuth error handler
 */
router.get('/error', (req: Request, res: Response) => {
    res.status(401).json({ error: 'Authentication failed' });
});

/**
 * POST /auth/verify
 * Verify JWT token
 */
router.post('/verify', (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});

export default router;
