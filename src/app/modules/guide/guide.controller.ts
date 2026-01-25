/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { GuideApplicationStatus, IGuideApplication } from './guide.interface';
import { GuideServices } from './guide.service';

const applyAsGuide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const payload: IGuideApplication = {
        ...req.body,
        user: decodedToken.userId,
        nidPhoto: req.file?.path,
        status: GuideApplicationStatus.PENDING
    };

    const result = await GuideServices.applyAsGuide(payload, decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Applied as a Guide Successfully",
        data: result
    });
});

const approveGuideApplication = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const id = req.params.id;

    const updatedApplication = await GuideServices.approveGuideApplication(status, id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guide Application Updated Successfully",
        data: updatedApplication
    });
});

const getAppliedGuides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const appliedGuides = await GuideServices.getAllGuideApplication(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guides Retrieved Successfully",
        data: appliedGuides.data,
        meta: appliedGuides.meta
    });
});

const getSingleGuideApplication = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await GuideServices.getSingleGuideApplication(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guide Retrieved Successfully",
        data: result
    });
});

export const GuideControllers = {
    applyAsGuide,
    approveGuideApplication,
    getAppliedGuides,
    getSingleGuideApplication
}