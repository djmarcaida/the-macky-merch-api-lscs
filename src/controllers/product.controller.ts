import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { NotFoundError, BadRequestError } from '../errors/AppError';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await productService.getAllProducts(req.query as any);

    if (Array.isArray(result)) {
      res.status(200).json({
        status: 'success',
        results: result.length,
        data: { products: result },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      results: result.items.length,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
      data: { products: result.items },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await productService.getProductById(id);

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BadRequestError('Request body cannot be empty');
    }

    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
