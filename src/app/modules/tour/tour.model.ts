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

tourSchema.pre("save", async function (next) {
    if (this.isModified("title")) {
        const baseSlug = this.title.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}`;

        let count = 0
        while (await Tour.exists({ slug })) {
            slug = `${slug}-${count++}`;
        }

        this.slug = slug;
    }

    next();
})

tourSchema.pre("findOneAndUpdate", async function (next) {
    const tour = this.getUpdate() as Partial<ITour>;

    if (tour.title) {
        const baseSlug = tour.title.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}`;

        let count = 0
        while (await Tour.exists({ slug })) {
            slug = `${slug}-${count++}`;
        }

        tour.slug = slug;
    }

    this.setUpdate(tour);
    next();
})

export const Tour = model<ITour>("Tour", tourSchema);