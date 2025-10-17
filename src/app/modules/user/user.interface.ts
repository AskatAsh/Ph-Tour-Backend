import { Types } from "mongoose";

export enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    SUPER_ADMIN = "SUPER_ADMIN"
}

export enum AuthProvider {
    GOOGLE = "GOOGLE",
    CREDENTIAL = "CREDENTIAL",
    GITHUB = "GITHUB"
}

export interface IAuthProvider {
    provider: AuthProvider;
    providerId: string;
}

export enum Status {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IUser {
    _id?: Types.ObjectId
    name: string;
    email: string;
    password?: string;
    profilePhoto?: string;
    address?: string;
    phone?: string;

    status?: Status;
    isVerified?: boolean;
    role: Role;
    auths: IAuthProvider[];

    // Security Logs
    lastLogin?: Date;
    passwordChangedAt?: Date;

    // Soft Delete
    isDeleted?: boolean;
    deletedAt?: Date;

    // References
    referenceCollectionOne?: Types.ObjectId[];
    referenceCollectionTwo?: Types.ObjectId[];
}