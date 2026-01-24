/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
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

const getAppliedGuides = async (query: Record<string, string>) => {

    const {
        searchTerm,
        status,
        division,
        user,
        page = "1",
        limit = "10",
        sortBy = "-createdAt"
    } = query;

    const pageNumber = Math.max(Number(page || 1), 1);
    const limitNumber = Math.max(Number(limit || 1), 1);
    const skip = Math.max((pageNumber - 1) * limitNumber, 0);

    const pipeline: any[] = [];

    // filter by status
    if (status) {
        pipeline.push({ $match: { status } });
    }

    // filter by user
    if (user) {
        pipeline.push({ $match: { user: new Types.ObjectId(user) } });
    }

    // filter by division
    if (division) {
        pipeline.push({ $match: { division: new Types.ObjectId(division) } });
    }

    // lookup user
    pipeline.push({
        $lookup: {
            from: "users",
            let: { userId: "$user" },
            pipeline: [
                {
                    $match: { $expr: { $eq: ["$_id", "$$userId"] } }
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "email": 1,
                        "phone": 1,
                        "address": 1
                    }
                }
            ],
            as: "user",
        }
    });

    // unwind user
    pipeline.push({ $unwind: "$user" });

    // lookup division
    pipeline.push({
        $lookup: {
            from: "divisions",
            let: { divisionId: "$division" },
            pipeline: [
                {
                    $match: { $expr: { $eq: ["$_id", "$$divisionId"] } }
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "slug": 1
                    }
                }
            ],
            as: "division",
        }
    });

    // unwind division
    pipeline.push({ $unwind: "$division" });

    // search joined fields
    if (searchTerm) {
        pipeline.push({
            $match: {
                $or: [
                    { "user.name": { $regex: searchTerm, $options: "i" } },
                    { "user.email": { $regex: searchTerm, $options: "i" } },
                    { "user.phone": { $regex: searchTerm, $options: "i" } },
                    { "user.address": { $regex: searchTerm, $options: "i" } },
                    { "division.name": { $regex: searchTerm, $options: "i" } }
                ]
            }
        });
    }

    // sorting
    pipeline.push({
        $sort: sortBy.startsWith("-") ? {
            [sortBy.substring(1)]: -1
        } : {
            [sortBy]: 1
        }
    })

    // pagination and meta
    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limitNumber }
            ],
            meta: [
                { $count: "total" }
            ]
        }
    });

    const result = await GuideApplication.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].meta[0]?.total || 0;

    return {
        data,
        meta: {
            total: total,
            page: pageNumber,
            limit: limitNumber,
            totalPage: Math.ceil(total / limitNumber)
        }
    }
}

export const GuideServices = {
    applyAsGuide,
    approveGuideApplication,
    getAppliedGuides
};