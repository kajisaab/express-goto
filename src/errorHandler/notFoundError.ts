import { StatusCode } from '../common/status-code.constant';
import { CustomError } from './CustomError';

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message, StatusCode.NOT_FOUND, 'Not Found');
    }
}
