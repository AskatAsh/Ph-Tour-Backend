/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import { IErrorHandlerResponse } from "../interfaces/error.types";

// duplicate error handler
export const handleDupicateError = (error: any): IErrorHandlerResponse => {
    const statusCode = httpStatus.BAD_REQUEST;
    const matchedArray = error.message.match(/"([^"]*)"/);
    const message = `${matchedArray[1]} Already Exists.`

    return { statusCode, message };
}