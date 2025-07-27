import { StatusCode } from '../common/status-code.constant';
import { CustomError } from './CustomError';

export class ForbiddenError extends CustomError {
    constructor(message: string) {
        super(message, StatusCode.FORBIDDEN, 'Access Denied');
    }
}
