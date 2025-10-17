/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import { ZodError } from 'zod';
import { IErrorHandlerResponse, IErrorSources } from '../interfaces/error.types';

// zod error handler
export const handleZodError = (error: ZodError, errorSources: IErrorSources[]): IErrorHandlerResponse => {
    const errors = JSON.parse(error.message);

    errors.forEach((errorObject: any) => errorSources.push({
        path: errorObject.path.length === 1 ?
            errorObject.path[errorObject.path.length - 1] :
            errorObject.path.reverse().join(" inside "),
        message: errorObject.message
    }));

    const statusCode = httpStatus.BAD_REQUEST;
    const message = "Zod Validation Error Occured.";
    return { statusCode, message };
}