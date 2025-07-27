import jwt, { SignOptions } from 'jsonwebtoken';
import { AppLogger } from '../logger';
import { UserDetails } from '../RequestContext/userDetails';

export interface TokenPayload {
    userDetails: UserDetails;
    iat?: number;
    exp?: number;
}

export class JwtStrategy {
    private readonly JWT_SECRET: string;
    private readonly JWT_EXPIRES_IN: string;
    private readonly REFRESH_SECRET: string;
    private readonly REFRESH_EXPIRES_IN: string;
    private readonly logger: AppLogger;

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'secret';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '600';
        this.REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
        this.REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '86400';
        this.logger = new AppLogger();
    }

    generateAccessToken(userDetails: UserDetails): string {
        const payload: TokenPayload = { userDetails };
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        } as SignOptions);
    }

    generateRefreshToken(userDetails: UserDetails): string {
        const payload: TokenPayload = { userDetails };
        return jwt.sign(payload, this.REFRESH_SECRET, {
            expiresIn: this.REFRESH_EXPIRES_IN,
        } as SignOptions);
    }

    validateAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            if (decoded && typeof decoded === 'object' && 'userDetails' in decoded) {
                return decoded as TokenPayload;
            }
            this.logger.error('Invalid token payload structure');
            return null;
        } catch (err) {
            if (err && typeof err === 'object' && 'message' in err) {
                this.logger.error(`Access token validation error: ${(err as Error).message}`);
            } else {
                this.logger.error('Unknown error during access token validation');
            }
            return null;
        }
    }

    validateRefreshToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.REFRESH_SECRET);
            if (decoded && typeof decoded === 'object' && 'userDetails' in decoded) {
                return decoded as TokenPayload;
            }
            this.logger.error('Invalid refresh token payload structure');
            return null;
        } catch (err) {
            if (err && typeof err === 'object' && 'message' in err) {
                this.logger.error(`Refresh token validation error: ${(err as Error).message}`);
            } else {
                this.logger.error('Unknown error during refresh token validation');
            }
            return null;
        }
    }

    extractPayload(token: string): TokenPayload | null {
        try {
            const decoded = jwt.decode(token);
            if (decoded && typeof decoded === 'object' && 'userDetails' in decoded) {
                return decoded as TokenPayload;
            }
            this.logger.error('Invalid token payload structure');
            return null;
        } catch (err) {
            if (err && typeof err === 'object' && 'message' in err) {
                this.logger.error(`Token payload extraction error: ${(err as Error).message}`);
            } else {
                this.logger.error('Unknown error during token payload extraction');
            }
            return null;
        }
    }
}
