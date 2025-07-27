import { Response } from 'express';
import { UseCaseRequest } from './usecase.request';
import { UseCaseResponse } from './usecase.response';
import { RequestContext } from '../RequestContext/requestContext';
import { Result } from '..';

export interface UseCase<I extends UseCaseRequest, U extends UseCaseResponse> {
    execute(request: I, requestContext?: RequestContext, response?: Response): Promise<Result<U>>;
}
