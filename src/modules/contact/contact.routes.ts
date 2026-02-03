
import { Router } from 'express';
import { ContactController } from './contact.controller';
import { validateSchema, contactSchema } from './contact.validation';
import { generalRateLimit } from '../../common/middlewares/rateLimit.middleware';

const router = Router();

router.post('/', generalRateLimit, validateSchema(contactSchema), ContactController.submitContactForm);

export { router as contactRoutes };
