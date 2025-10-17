import cookieParser from "cookie-parser";
import cors from 'cors';
import express, { Request, Response } from "express";
import expressSession from 'express-session';
import passport from "passport";
import { envVars } from "./app/config/env";
import './app/config/passport';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFoundHandler from './app/middlewares/notFoundHandler';
import { router } from './app/routes';

// create express app
const app = express();

// middleware for express session
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

// middlewar for passport
app.use(passport.initialize());
app.use(passport.session());

// middleware to parse request body
app.use(express.json());

// middleware to parse cookies
app.use(cookieParser());

// middleware for cross origin resource sharing
app.use(cors());

// middleware for routes
app.use('/api/v1/', router);

// root get api
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "Authentication server is running..."
    })
})

// global error handler
app.use(globalErrorHandler);

// not found handler
app.use(notFoundHandler)

export default app;