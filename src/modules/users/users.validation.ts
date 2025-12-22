import { z } from 'zod';
import { UserRole } from '../../common/types';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .trim(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .trim(),
    email: z.string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    phone: z.string().optional(),
    role: z.enum([UserRole.ADMIN, UserRole.STAFF, UserRole.USER]),
    avatar: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .trim()
      .optional(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .trim()
      .optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
    role: z.enum([UserRole.ADMIN, UserRole.STAFF, UserRole.USER]).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .trim()
      .optional(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .trim()
      .optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().transform(str => str ? new Date(str) : undefined).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    preferences: z.object({
      newsletter: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
    }).optional(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    type: z.enum(['billing', 'shipping']),
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .trim(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .trim(),
    company: z.string().optional(),
    addressLine1: z.string()
      .min(1, 'Address line 1 is required')
      .trim(),
    addressLine2: z.string().optional(),
    city: z.string()
      .min(1, 'City is required')
      .trim(),
    state: z.string()
      .min(1, 'State is required')
      .trim(),
    postalCode: z.string()
      .min(1, 'Postal code is required')
      .trim(),
    country: z.string()
      .min(1, 'Country is required')
      .trim(),
    phone: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};