
import { model, Schema } from "mongoose";
import { AuthProvider, IAuthProvider, IUser, Role, Status } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: {
        type: String,
        enum: Object.values(AuthProvider),
        required: true
    },
    providerId: {
        type: String
    }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 50,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email address"]
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        match: [/^(?:\+8801\d{9}|01\d{9})$/, "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX"]
    },
    password: {
        type: String,
        select: false
    },
    profilePhoto: {
        type: String,
        trim: true
    },
    address: {
        type: String,
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.ACTIVE
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER,
        required: true
    },
    auths: [authProviderSchema],
    // Security Logs
    lastLogin: {
        type: Date
    },
    passwordChangedAt: {
        type: Date
    },
    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    // References
    // referenceCollectionOne: {
    //     type: Schema.Types.ObjectId,
    //     ref: "collection_name", // a reference to another mongodb collection or schema
    // }
},
    {
        timestamps: true,
        versionKey: false
    })

const User = model<IUser>("User", userSchema);

export default User;