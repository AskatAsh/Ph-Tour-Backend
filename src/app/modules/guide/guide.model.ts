import { model, Schema } from "mongoose";
import { GuideApplicationStatus, IGuideApplication } from "./guide.interface";

const guideApplicationSchema = new Schema<IGuideApplication>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    division: {
        type: Schema.Types.ObjectId,
        required: true
    },
    nidPhoto: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(GuideApplicationStatus),
        default: GuideApplicationStatus.PENDING
    }
},
    {
        timestamps: true,
        versionKey: false
    });

const GuideApplication = model<IGuideApplication>("GuideApplication", guideApplicationSchema);

export default GuideApplication;