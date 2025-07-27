// Note : Our custom error extends from Error, so we can throw this error as an exception,
export class CustomError extends Error {
    status: number;
    code: string;
    data: {
        message: string;
    };

    constructor(message: string = 'Error', status: number = 400, code: string = '-1') {
        super(message);
        this.code = code;
        this.status = status;
        this.data = {
            message,
        };
    }
}

export interface IResponseError {
    status?: number;
    code: string;
    message: string;
    data: {
        message: string;
    };
}
