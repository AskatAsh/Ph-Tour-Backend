/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import { IErrorHandlerResponse, IErrorSources } from '../interfaces/error.types';

// validation error handler
export const handleValidationError = (error: mongoose.Error.ValidationError, errorSources: IErrorSources[]): IErrorHandlerResponse => {
    const errors = Object.values(error.errors);

    errors.forEach((errorObject: any) => errorSources.push({
        path: errorObject.path,
        message: errorObject.message
    }));

    const statusCode = httpStatus.BAD_REQUEST;
    const message = "Validation Error Occured! Please Provide Valid Data."

    return { statusCode, message };
}