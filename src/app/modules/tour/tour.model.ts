import { model, Schema } from "mongoose";
import { ITour, ITourType } from "./tour.interface";

const tourTypeSchema = new Schema<ITourType>({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
    }
}, {
    timestamps: true,
    versionKey: false
})

export const TourType = model<ITourType>("TourType", tourTypeSchema);

const tourSchema = new Schema<ITour>({
    title: {
        type: String,
        minLength: 2,
        trim: true,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        minLength: 2,
        trim: true,
        unique: true,
        required: true
    },
    description: {
        type: String,
    },
    images: {
        type: [String],
        default: [],
    },
    location: {
        type: String,
    },
    costFrom: {
        type: Number,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    included: {
        type: [String],
        default: [],
    },
    excluded: {
        type: [String],
        default: [],
    },
    amenities: {
        type: [String],
        default: [],
    },
    tourPlan: {
        type: [String],
        default: [],
    },
    maxGuest: {
        type: Number,
    },
    minAge: {
        type: Number,
    },
    tourType: {
        type: Schema.Types.ObjectId,
        ref: "TourType",
        required: true,
    },
    division: {
        type: Schema.Types.ObjectId,
        ref: "Division",
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false
})

export const Tour = model<ITour>("Tour", tourSchema);