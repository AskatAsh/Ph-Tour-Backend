import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import { IErrorHandlerResponse } from '../interfaces/error.types';

// cast error handler
export const handleCastError = (error: mongoose.Error.CastError): IErrorHandlerResponse => {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = error.message;
    return { statusCode, message };
}