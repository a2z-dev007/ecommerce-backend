import { Request, Response } from 'express';
import { TestimonialsService } from './testimonials.service';

const testimonialsService = new TestimonialsService();

export class TestimonialsController {
    async createTestimonial(req: Request, res: Response) {
        try {
            const testimonial = await testimonialsService.createTestimonial(req.body);
            res.status(201).json({ success: true, data: testimonial });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating testimonial', error });
        }
    }

    async getAllTestimonials(req: Request, res: Response) {
        try {
            const testimonials = await testimonialsService.getAllTestimonials();
            res.status(200).json({ success: true, data: testimonials });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching testimonials', error });
        }
    }

    async getTestimonialById(req: Request, res: Response) {
        try {
            const testimonial = await testimonialsService.getTestimonialById(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: 'Testimonial not found' });
            }
            res.status(200).json({ success: true, data: testimonial });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching testimonial', error });
        }
    }

    async updateTestimonial(req: Request, res: Response) {
        try {
            const testimonial = await testimonialsService.updateTestimonial(req.params.id, req.body);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: 'Testimonial not found' });
            }
            res.status(200).json({ success: true, data: testimonial });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating testimonial', error });
        }
    }

    async deleteTestimonial(req: Request, res: Response) {
        try {
            const testimonial = await testimonialsService.deleteTestimonial(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: 'Testimonial not found' });
            }
            res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting testimonial', error });
        }
    }

    async getAllTestimonialsAdmin(req: Request, res: Response) {
        try {
            const testimonials = await testimonialsService.getAllTestimonialsAdmin();
            res.status(200).json({ success: true, data: testimonials });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching testimonials', error });
        }
    }
}
