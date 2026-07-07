import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_64_character_random_string_for_local_testing_only';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Generates a standard, secure JWT token for authenticated session management.
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role
    },
    JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

/**
 * Express middleware to verify JWT Authorization tokens.
 */
export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token is empty' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error('[JWT] Verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid, expired, or corrupted token' });
  }
}

/**
 * Middleware to restrict route access based on user role.
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User authentication is required' });
    }

    const userRole = (req.user.role || 'client').toLowerCase();
    const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!isAllowed) {
      return res.status(403).json({ 
        error: `Forbidden: This action is restricted to the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }

    next();
  };
}

// Named specific role gatekeepers
export const isAdmin = requireRole(['admin']);
export const isModel = requireRole(['model']);
export const isAgency = requireRole(['agency']);
export const isUser = requireRole(['client', 'admin', 'model', 'agency']);
