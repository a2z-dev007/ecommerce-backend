import { Subscriber, ISubscriber } from '../../database/models/Subscriber';

export class NewsletterService {
    async subscribe(email: string): Promise<ISubscriber> {
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            if (!existingSubscriber.isActive) {
                existingSubscriber.isActive = true;
                await existingSubscriber.save();
                return existingSubscriber;
            }
            throw new Error('Email already subscribed');
        }
        return await Subscriber.create({ email });
    }

    async getAllSubscribers(): Promise<ISubscriber[]> {
        return await Subscriber.find().sort({ createdAt: -1 });
    }

    async unsubscribe(email: string): Promise<ISubscriber | null> {
        return await Subscriber.findOneAndUpdate({ email }, { isActive: false }, { new: true });
    }
}
