/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);

        console.log("Successfully connected to mongodb!");
        server = app.listen(envVars.PORT, () => {
            console.log(`Server listening to: http://localhost:${envVars.PORT}`)
        })

    } catch (error) {
        console.log(error);
    }
}



(async () => {
    await startServer();
    await seedSuperAdmin();
})()

// unhandled rejection error
process.on('unhandledRejection', (error) => {
    console.log("Unhandled rejection detected! Server shutting down...\n", error);

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})
// Promise.reject("Forgot to catch this promise.");

// uncaught exception error
process.on('uncaughtException', (error) => {
    console.log("Uncaught exception detected! Server shutting down...\n", error);

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})
// throw new Error("Forgot to handle local errors.");

// signal termination error
process.on('SIGTERM', () => {
    console.log("SIGTERM Signal detected! Server shutting down...");

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})

// signal interruption error
process.on('SIGINT', () => {
    console.log("SIGINT Signal detected! Server shutting down...");

    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})