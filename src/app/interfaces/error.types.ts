export interface IErrorSources {
    path: string;
    message: string;
}

export interface IErrorHandlerResponse {
    statusCode: number;
    message: string;
}