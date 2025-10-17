import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";

const divisionSchema = new Schema<IDivision>({
    name: {
        type: String,
        trim: true,
        minLength: 2,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        trim: true,
        minLength: 2,
        required: true,
        unique: true

    },
    thumbnail: {
        type: String,
    },
    description: {
        type: String,
    }
}, {
    timestamps: true,
    versionKey: false
})

const Division = model<IDivision>("Division", divisionSchema);

export default Division;