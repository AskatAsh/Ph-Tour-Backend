/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IGuideApplication } from "./guide.interface";
import GuideApplication from "./guide.model";

const applyAsGuide = async (payload: Partial<IGuideApplication>, userId: string) => {
    try {
        const isAlreadyApplied = await GuideApplication.findOne({ user: userId });

        if (isAlreadyApplied) {
            throw new AppError(httpStatus.BAD_REQUEST, "Already applied as a guide. Please wait for approval.");
        }

        if (!payload.nidPhoto) {
            throw new AppError(httpStatus.BAD_REQUEST, "Please upload your nid photo");
        }

        const guideApplication = await GuideApplication.create(payload);

        return guideApplication;

    } catch (error: any) {
        console.log(`Error applying for guide: ${error.message}`);
        throw new AppError(httpStatus.BAD_REQUEST, `Error applying for guide: ${error.message}`);
    }
}


export const GuideServices = {
    applyAsGuide
};