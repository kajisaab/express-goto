import { StatusCode } from '../common/status-code.constant';
import { CustomError } from './CustomError';

export class BadRequestException extends CustomError {
    constructor(message: string, title: string = 'Bad Request') {
        super(message, StatusCode.BAD_REQUEST, title);
    }
}
