import { StatusCode } from '../common/status-code.constant';
import { CustomError } from './CustomError';

export class CorsError extends CustomError {
    constructor(message: string, title: string = 'Cors Error') {
        super(message, StatusCode.REJECTED_URL, title);
    }
}
