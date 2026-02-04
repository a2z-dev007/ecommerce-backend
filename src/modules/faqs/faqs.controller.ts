import { Request, Response } from 'express';
import { FaqsService } from './faqs.service';

const faqsService = new FaqsService();

export class FaqsController {
    async createFaq(req: Request, res: Response) {
        try {
            const faq = await faqsService.createFaq(req.body);
            res.status(201).json({ success: true, data: faq });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating FAQ', error });
        }
    }

    async getAllFaqs(req: Request, res: Response) {
        try {
            const faqs = await faqsService.getAllFaqs();
            res.status(200).json({ success: true, data: faqs });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching FAQs', error });
        }
    }

    async getFaqById(req: Request, res: Response) {
        try {
            const faq = await faqsService.getFaqById(req.params.id);
            if (!faq) {
                return res.status(404).json({ success: false, message: 'FAQ not found' });
            }
            res.status(200).json({ success: true, data: faq });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching FAQ', error });
        }
    }

    async updateFaq(req: Request, res: Response) {
        try {
            const faq = await faqsService.updateFaq(req.params.id, req.body);
            if (!faq) {
                return res.status(404).json({ success: false, message: 'FAQ not found' });
            }
            res.status(200).json({ success: true, data: faq });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating FAQ', error });
        }
    }

    async deleteFaq(req: Request, res: Response) {
        try {
            const faq = await faqsService.deleteFaq(req.params.id);
            if (!faq) {
                return res.status(404).json({ success: false, message: 'FAQ not found' });
            }
            res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting FAQ', error });
        }
    }

    async getAllFaqsAdmin(req: Request, res: Response) {
        try {
            const faqs = await faqsService.getAllFaqsAdmin();
            res.status(200).json({ success: true, data: faqs });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching FAQs', error });
        }
    }
}
