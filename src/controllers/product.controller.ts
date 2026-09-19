import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
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
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await productService.getAllProducts(
      page !== undefined && limit !== undefined ? { page, limit } : undefined
    );

    if ('items' in result) {
      res.setHeader('X-Total-Count', result.total.toString());
      res.setHeader('X-Page', result.page.toString());
      res.setHeader('X-Limit', result.limit.toString());
      res.setHeader('X-Total-Pages', result.totalPages.toString());
      res.status(200).json(result.items);
      return;
    }

    res.setHeader('X-Total-Count', result.length.toString());
    res.status(200).json(result);
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
      res.status(404).json({
        error: true,
        message: 'Product not found.',
      });
      return;
    }

    res.status(200).json(product);
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
    const updatedProduct = await productService.updateProduct(id, req.body);

    if (!updatedProduct) {
      res.status(404).json({
        error: true,
        message: 'Product not found.',
      });
      return;
    }

    res.status(200).json(updatedProduct);
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
    const isDeleted = await productService.deleteProduct(id);

    if (!isDeleted) {
      res.status(404).json({
        error: true,
        message: 'Product not found.',
      });
      return;
    }

    res.status(200).json({
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
