import { BadRequestException } from '../errorHandler/BadRequestException';
import type { Request, Response, NextFunction } from 'express';
import type Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body, { abortEarly: false });
            next();
        } catch (error) {
            const details = (error as Joi.ValidationError).details;
            const message = details.map((i) => i.message.replace(/"/g, '')).join(' & ');
            next(new BadRequestException(message, 'Bad Request'));
        }
    };
};
