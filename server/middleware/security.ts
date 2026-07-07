import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
// @ts-ignore
import xss from 'xss-clean';

export function setupSecurityMiddlewares(app: Express) {
  // 1. Enable Helmet for secure HTTP headers (XSS, Frame Protection, MIME, HSTS, etc.)
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP if we need to let the iframe or external assets load smoothly
    crossOriginEmbedderPolicy: false,
  }));

  // 2. Configure CORS with dynamic origin from environment secrets
  const allowedOrigin = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or local testing)
      if (!origin || origin === allowedOrigin || allowedOrigin.includes(origin) || origin.includes('localhost') || origin.includes('run.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // 3. Prevent HTTP Parameter Pollution (HPP)
  app.use(hpp());

  // 4. Sanitize user inputs against Cross-Site Scripting (XSS) attacks
  app.use(xss());

  // 5. Compress responses to optimize bandwidth
  app.use(compression());

  // 6. Cookie Parser for parsing client-side tokens securely
  const cookieSecret = process.env.COOKIE_SECRET || 'default_cookie_secret_signing_key_12345';
  app.use(cookieParser(cookieSecret));

  // 7. Global API Rate Limiting to prevent brute-force & DDoS
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      error: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  });

  // Apply rate limiter specifically to /api/ routes to avoid rate limiting static frontend asset bundles
  app.use('/api/', apiLimiter);
}
