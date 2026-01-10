/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from 'ejs';
import httpStatus from 'http-status-codes';
import nodemailer from "nodemailer";
import path from 'path';
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";

const transport = nodemailer.createTransport({
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    },
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
})

interface SendMailOptions {
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
    attachments?: {
        fileName: string,
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendMail = async ({
    to,
    subject,
    templateName,
    templateData,
    attachments
}: SendMailOptions) => {
    try {
        const templatePath = path.join(__dirname, `/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);
        const info = await transport.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(attachment => ({
                fileName: attachment.fileName,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })
        console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
        console.log("Email sending error:", error.message);
        throw new AppError(httpStatus.BAD_REQUEST, "Error Sending Email.");
    }
}