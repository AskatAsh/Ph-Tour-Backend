/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { Role } from "../user/user.interface";
import User from "../user/user.model";
import { GuideApplicationStatus, IGuideApplication } from "./guide.interface";
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

const approveGuideApplication = async (status: GuideApplicationStatus, guideApplicationId: string) => {

    // start db session
    const session = await GuideApplication.startSession();
    session.startTransaction();

    try {
        const application = await GuideApplication.findById(guideApplicationId).session(session);

        if (!application) {
            throw new AppError(httpStatus.NOT_FOUND, "Could not find guide application");
        }

        // request body status can only be "Approved" or "Rejected"
        if (![GuideApplicationStatus.APPROVED, GuideApplicationStatus.REJECTED].includes(status)) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid status value");
        }

        // only pending guide applications can proceed
        if (application.status !== GuideApplicationStatus.PENDING) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `This guide application is already ${application.status.toLowerCase()}`
            );
        }

        // applied guide must be a valid user first
        const user = await User.findById(application.user).session(session);
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "Applied user not found");
        }

        // admin and already a guide role cannot become a guide
        if (status === GuideApplicationStatus.APPROVED && user.role !== Role.USER) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "User is not eligible to become a guide"
            );
        }

        const updatedApplication = await GuideApplication.findByIdAndUpdate(
            guideApplicationId,
            { status },
            { new: true, runValidators: true, session });

        if (GuideApplicationStatus.APPROVED === status) {
            await User.findByIdAndUpdate(
                user._id,
                { role: Role.GUIDE },
                { runValidators: true, session });
        }

        await session.commitTransaction();
        return updatedApplication;


    } catch (error: any) {
        await session.abortTransaction();

        console.log(`Error approving guide: ${error.message}`);
        throw error;
    } finally {
        session.endSession();
    }
}


export const GuideServices = {
    applyAsGuide,
    approveGuideApplication
};