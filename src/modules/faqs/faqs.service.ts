import { Faq, IFaq } from '../../database/models/Faq';

export class FaqsService {
    async createFaq(data: Partial<IFaq>): Promise<IFaq> {
        return await Faq.create(data);
    }

    async getAllFaqs(): Promise<IFaq[]> {
        return await Faq.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }

    async getFaqById(id: string): Promise<IFaq | null> {
        return await Faq.findById(id);
    }

    async updateFaq(id: string, data: Partial<IFaq>): Promise<IFaq | null> {
        return await Faq.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteFaq(id: string): Promise<IFaq | null> {
        return await Faq.findByIdAndDelete(id);
    }

    async getAllFaqsAdmin(): Promise<IFaq[]> {
        return await Faq.find().sort({ order: 1, createdAt: -1 });
    }
}
