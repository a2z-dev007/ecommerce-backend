import { Testimonial, ITestimonial } from '../../database/models/Testimonial';

export class TestimonialsService {
    async createTestimonial(data: Partial<ITestimonial>): Promise<ITestimonial> {
        return await Testimonial.create(data);
    }

    async getAllTestimonials(): Promise<ITestimonial[]> {
        return await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    }

    async getTestimonialById(id: string): Promise<ITestimonial | null> {
        return await Testimonial.findById(id);
    }

    async updateTestimonial(id: string, data: Partial<ITestimonial>): Promise<ITestimonial | null> {
        return await Testimonial.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteTestimonial(id: string): Promise<ITestimonial | null> {
        return await Testimonial.findByIdAndDelete(id);
    }

    async getAllTestimonialsAdmin(): Promise<ITestimonial[]> {
        return await Testimonial.find().sort({ createdAt: -1 });
    }
}
