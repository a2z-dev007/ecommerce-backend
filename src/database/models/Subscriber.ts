import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please parse a valid email address'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export const Subscriber = mongoose.model<ISubscriber>('Subscriber', subscriberSchema);
