import httpStatus from 'http-status-codes';
import { deleteImageFromCloudinary } from '../../config/cloudinary.config';
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from '../../utils/QueryBuilder';
import { tourSearchableFields, tourTypeSearchableFields } from './tour.constant';
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
    const existingTour = await Tour.findById(id);
    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    // add new tour images with existing
    if (payload.images && payload.images.length && existingTour.images && existingTour.images.length) {
        payload.images = [...payload.images, ...existingTour.images];
    }

    // if user want to delete tour images
    if (payload.deleteImages && payload.deleteImages.length && existingTour.images && existingTour.images.length) {
        const restDBImages = existingTour.images.filter(imageUrl => !payload.deleteImages?.includes(imageUrl));

        const updatePayloadImages = (payload.images || [])
            .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
            .filter(imageUrl => !restDBImages.includes(imageUrl));

        payload.images = [...restDBImages, ...updatePayloadImages]
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

    if (payload.deleteImages && payload.deleteImages.length && existingTour.images && existingTour.images.length) {
        await Promise.all(payload.deleteImages.map(imageUrl => deleteImageFromCloudinary(imageUrl)));
    }

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
const getAllTourType = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(TourType.find(), query);

    const tourTypes = queryBuilder
        .filter()
        .search(tourTypeSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        tourTypes.build(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    }
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