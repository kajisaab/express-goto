import { CorsOptions } from 'cors';
import { CorsError } from '..';

/**
 * DEFINE ALLOWED ORIGINS
 */
const allowedOrigins = process.env.ALLOWED_CORS || ['http://localhost:3000', 'http://localhost:4000', 'http://localhost', 'http://localhost:80'];

/**
 * DEFINE CORS OPTIONS
 */
export const corsOptions: CorsOptions = {
    origin: function (requestOrigin: string | undefined, callback: (err: Error | null, origin?: boolean | string | RegExp | Array<boolean | string | RegExp>) => void) {
        if (!requestOrigin) {
            return callback(null, true); // Allow server-to-server requests with no origin
        }

        if (allowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
        } else {
            callback(new CorsError('Sorry!, you do not have access') as Error, false);
        }
    },
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
