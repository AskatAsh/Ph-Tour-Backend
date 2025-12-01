import httpStatus from 'http-status-codes';
import { Query } from 'mongoose';
import AppError from "../../errorHelpers/appError";
import { excludeFields } from '../../utils/constants';
import { tourSearchableFields } from './tour.constant';
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

// tour services
// create tour
const createTour = async (payload: ITour) => {

    const existTour = await Tour.find({ title: payload.title });
    if (!existTour) {
        throw new AppError(httpStatus.BAD_REQUEST, "A tour with this title already exists.");
    }

    const tour = await Tour.create(payload);

    return tour;
}

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public readonly query: Record<string, string>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    filter(): this {
        const query = { ...this.query };

        const filter = Object.fromEntries(
            Object.entries(query).filter(([key]) => !excludeFields.includes(key))
        );

        this.modelQuery = this.modelQuery.find(filter);

        return this;
    }

    search(searchableFields: string[]): this {
        const searchTerm = this.query?.searchTerm || "";
        const searchQuery = {
            $or: searchableFields.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } }))
        };

        this.modelQuery = this.modelQuery.find(searchQuery);

        return this;
    }

    sort(): this {
        const sortBy = this.query?.sortBy || "-createdAt";
        this.modelQuery = this.modelQuery.sort(sortBy);

        return this;
    }
    fields(): this {
        const fields = this.query?.fields?.split(",").join(" ") || "";
        this.modelQuery = this.modelQuery.select(fields);

        return this;
    }
    paginate(): this {
        const page = Number(this.query?.page || 1);
        const limit = Number(this.query?.limit || 10);
        const skip = (page - 1) * limit < 0 ? 0 : (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }
    build() {
        return this.modelQuery;
    }
    async getMeta() {
        const totalDocuments = await this.modelQuery.model.countDocuments();
        const page = Number(this.query?.page || 1);
        const limit = Number(this.query?.limit || 10);

        const totalPage = Math.ceil(totalDocuments / limit);

        const meta = {
            total: totalDocuments,
            page: page,
            limit: limit,
            totalPage: totalPage
        }
        return meta;
    }
}

// get all tour
const getAllTour = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Tour.find(), query);

    const tours = queryBuilder
        .filter()
        .search(tourSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
}

// get single tour
const getSingleTour = async (slug: string) => {
    const tour = await Tour.findOne({ slug });

    return tour;
}

// update tour
const updateTour = async (id: string, payload: ITour) => {
    const existingTourType = await Tour.findById(id);
    if (!existingTourType) {
        throw new Error("Tour not found.");
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });
    return updatedTour;
}

// delete tour
const deleteTour = async (id: string) => {
    const existingTour = await Tour.findById(id);
    if (!existingTour) {
        throw new AppError(httpStatus.BAD_REQUEST, "Tour not found.");
    }

    return await Tour.findByIdAndDelete(id);
};


// tour type services
// create tour type
const createTourType = async (payload: ITourType) => {
    const existTourType = await Tour.find({ name: payload.name });
    if (!existTourType) {
        throw new AppError(httpStatus.BAD_REQUEST, "A tour type with this name already exists.");
    }

    const tourType = await TourType.create(payload);

    return {
        data: tourType
    };
}

// get tour types
const getAllTourType = async () => {
    const tourTypes = await TourType.find({});
    const totalTourTypes = await TourType.countDocuments();

    return {
        data: tourTypes,
        meta: {
            total: totalTourTypes
        }
    };
}

// get single tour type
const getSingleTourType = async (id: string) => {
    const tourType = await TourType.findById(id);
    return tourType;
};

// update tour type
const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new AppError(httpStatus.BAD_REQUEST, "Tour type not found.");
    }

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
}

// delete tour type
const deleteTourType = async (id: string) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new AppError(httpStatus.BAD_REQUEST, "Tour type not found.");
    }

    return await TourType.findByIdAndDelete(id);
};

export const TourService = {
    createTour,
    getAllTour,
    getSingleTour,
    updateTour,
    deleteTour,
    createTourType,
    getAllTourType,
    getSingleTourType,
    updateTourType,
    deleteTourType
}