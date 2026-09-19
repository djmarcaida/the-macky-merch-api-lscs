import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface RequestValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemaOrSchemas: ZodSchema | RequestValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('parseAsync' in schemaOrSchemas && typeof schemaOrSchemas.parseAsync === 'function') {
        req.body = await schemaOrSchemas.parseAsync(req.body);
      } else {
        const schemas = schemaOrSchemas as RequestValidationSchemas;
        if (schemas.body) {
          req.body = await schemas.body.parseAsync(req.body);
        }
        if (schemas.query) {
          req.query = (await schemas.query.parseAsync(req.query)) as any;
        }
        if (schemas.params) {
          req.params = (await schemas.params.parseAsync(req.params)) as any;
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
