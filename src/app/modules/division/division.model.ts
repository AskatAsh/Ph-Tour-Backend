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

divisionSchema.pre("save", async function (next) {
    if (this.isModified("name")) {
        const baseSlug = this.name.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}-division`;

        let count = 0
        while (await Division.exists({ slug })) {
            slug = `${slug}-${count++}`;
        }

        this.slug = slug;
    }

    next();
})

divisionSchema.pre("findOneAndUpdate", async function (next) {
    const division = this.getUpdate() as Partial<IDivision>;

    if (division.name) {
        const baseSlug = division.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}-division`

        let counter = 0;
        while (await Division.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        division.slug = slug
    }

    this.setUpdate(division);
    next();
})

const Division = model<IDivision>("Division", divisionSchema);

export default Division;