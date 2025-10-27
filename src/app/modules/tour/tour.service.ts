import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appError";
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
const getAllTour = async () => {
    const tours = await Tour.find({});
    const totalTours = await Tour.countDocuments();

    return {
        data: tours,
        meta: {
            total: totalTours
        }
    }
}


// tour type services
// create tour type
const createTourType = async (payload: ITourType) => {
    const existTourType = await Tour.find({ name: payload.name });
    if (!existTourType) {
        throw new AppError(httpStatus.BAD_REQUEST, "A tour type with this name already exists.");
    }

    const tourType = await TourType.create(payload);

    return tourType;
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

// update tour type
const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
}

export const TourService = {
    createTour,
    getAllTour,
    createTourType,
    getAllTourType,
    updateTourType
}