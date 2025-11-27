import httpStatus from 'http-status-codes';
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

// get all tour
const getAllTour = async (query: Record<string, string>) => {
    console.log("query:", query);
    const searchTerm = query?.searchTerm || "";

    const sortBy = query?.sortBy || "-createdAt";

    const fields = query?.fields?.split(",").join(" ") || "";

    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const skip = (page - 1) * limit < 0 ? 0 : (page - 1) * limit;

    const filter = Object.fromEntries(
        Object.entries(query).filter(([key]) => !excludeFields.includes(key))
    );

    console.log("filter:", filter);


    const searchQuery = {
        $or: tourSearchableFields.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } }))
    };

    const tours = await Tour.find(filter).find(searchQuery).sort(sortBy).select(fields).skip(skip).limit(limit);

    const totalTours = await Tour.countDocuments();

    return {
        data: tours,
        meta: {
            total: totalTours
        }
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