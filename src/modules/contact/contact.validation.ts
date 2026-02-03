
import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  }),
});

export const validateSchema = (schema: any) => (req: any, res: any, next: any) => {
  try {
    const { body, query, params } = req;
    schema.parse({ body, query, params });
    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || 'Validation Error',
      errors: error.errors,
    });
  }
};
