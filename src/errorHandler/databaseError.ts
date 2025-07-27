import { StatusCode } from '../common/status-code.constant';
import { CustomError } from './CustomError';

export class DatabaseError extends CustomError {
    constructor(message: string) {
        super(message, StatusCode.DB_CRASH);
    }
}
