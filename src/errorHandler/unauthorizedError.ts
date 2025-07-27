import { StatusCode } from '../common/status-code.constant';
import { CustomError } from './CustomError';

export class UnauthorizedError extends CustomError {
    constructor(message: string) {
        super(message, StatusCode.UNAUTHORIZED, 'Unauthorized');
    }
}
