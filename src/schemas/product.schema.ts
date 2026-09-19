import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(1, 'Name cannot be empty'),
  price: z.number({ required_error: 'Price is required' }).positive('Price must be greater than 0'),
  stock: z
    .number({ required_error: 'Stock is required' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty'),
  isAvailable: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().uuid('Invalid product ID format. Must be a valid UUID'),
});

export const productQuerySchema = z.object({
  category: z.string().trim().optional(),
  isAvailable: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().trim().optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform(Number)
    .refine((n) => n > 0, 'Page must be at least 1')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
