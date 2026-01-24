import { Types } from "mongoose";

export enum GuideApplicationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ARCHIVED = "ARCHIVED"
}

export interface IGuideApplication {
    user: Types.ObjectId,
    nidPhoto: string,
    division: Types.ObjectId,
    status: GuideApplicationStatus
}