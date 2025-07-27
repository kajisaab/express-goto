import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import { UnauthorizedError } from '../errorHandler/unauthorizedError';
import { JwtStrategy, TokenPayload } from '../jwt/jwtStrategy';
import { RequestContext } from './requestContext';

type InterceptorOptions = {
    customCallback?: (req: Request) => void | Promise<void>;
};

export function requestInterceptorFactory(options?: InterceptorOptions) {
    const { customCallback } = options || {};
    const jwtStrategy = new JwtStrategy();

    // Lazy-load publicRoutes from service's src/common/publicRoutes
    let publicRoutes: string[] = [];
    try {
        const publicRoutesPath = path.resolve(process.cwd(), 'src', 'common', 'publicRoutes.ts');
        // Support both default and named export
        const routes = require(publicRoutesPath);
        publicRoutes = routes.PublicRoutes || routes.default || [];
    } catch (err) {
        console.warn('⚠️ Could not load publicRoutes from src/common/publicRoutes.ts');
    }

    return async function requestInterceptor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Trim strings in params, query, body
            const inputs = [req.params, req.query, req.body];
            for (const input of inputs) {
                for (const key in input) {
                    const value = input[key];
                    if (typeof value === 'string' || value instanceof String) {
                        input[key] = value.trim();
                    }
                }
            }

            // Check if route is public
            const isExcludedRoute = publicRoutes.some((route) => req.originalUrl.includes(route));
            if (isExcludedRoute) {
                return next();
            }

            // Run optional custom logic
            if (typeof customCallback === 'function') {
                await customCallback(req);
            }

            // Validate token
            const token: string = req.headers['x-xsrf-token'] as string;
            if (!token) {
                throw new UnauthorizedError('Token not provided');
            }

            const isValidToken = jwtStrategy.validateAccessToken(token);
            if (!isValidToken) {
                throw new UnauthorizedError('Invalid token');
            }

            const jwtToken = jwtStrategy.extractPayload(token) as TokenPayload;

            if (!jwtToken) {
                throw new UnauthorizedError('User details not found in token');
            }

            new RequestContext(jwtToken.userDetails);

            let request: any = req;
            request['context'] = new RequestContext(jwtToken.userDetails);
            next();
        } catch (err) {
            next(err);
        }
    };
}
