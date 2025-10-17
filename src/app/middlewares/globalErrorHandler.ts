/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { handleCastError } from "../helpers/handleCastError";
import { handleDupicateError } from "../helpers/handleDuplicateError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";
import { IErrorSources } from "../interfaces/error.types";

// global error handler
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log(error);
    }

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";

    const errorSources: IErrorSources[] = [];

    // duplicate error
    if (error.code === 11000) {
        const simplifiedError = handleDupicateError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // cast error / objectId validation error
    else if (error.name === "CastError") {
        const simplifiedError = handleCastError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // validation error
    else if (error.name === "ValidationError") {
        const simplifiedError = handleValidationError(error, errorSources);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // zod error
    else if (error.name === "ZodError") {
        const simplifiedError = handleZodError(error, errorSources);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // errors from AppError
    else if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    // errors from Error
    else if (error instanceof Error) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        error: envVars.NODE_ENV === "development" ? error : null,
        stack: envVars.NODE_ENV === "development" ? error.stack : null
    })
}