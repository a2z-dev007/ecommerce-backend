import { Request, Response } from 'express';
import { NewsletterService } from './newsletter.service';

const newsletterService = new NewsletterService();

export class NewsletterController {
    async subscribe(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }
            const subscriber = await newsletterService.subscribe(email);
            res.status(201).json({ success: true, data: subscriber, message: 'Subscribed successfully' });
        } catch (error: any) {
            if (error.message === 'Email already subscribed') {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Error subscribing', error });
        }
    }

    async getAllSubscribers(req: Request, res: Response) {
        try {
            const subscribers = await newsletterService.getAllSubscribers();
            res.status(200).json({ success: true, data: subscribers });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching subscribers', error });
        }
    }

    async unsubscribe(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }
            const subscriber = await newsletterService.unsubscribe(email);
            if (!subscriber) {
                return res.status(404).json({ success: false, message: 'Subscriber not found' });
            }
            res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error unsubscribing', error });
        }
    }
}
