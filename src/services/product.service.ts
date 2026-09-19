import { Product, Prisma } from '@prisma/client';
import prisma from '../config/db';
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isAvailable?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Inserts a new product into SQLite via Prisma and returns the created record.
 */
export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  return prisma.product.create({
    data,
  });
};

/**
 * Fetches products. If `page` and `limit` are provided, performs paginated query with metadata.
 * Otherwise, returns all matching products ordered by createdAt descending.
 */
export async function getAllProducts(
  query: { page: number; limit: number } & Omit<PaginationQuery, 'page' | 'limit'>
): Promise<PaginatedResult<Product>>;
export async function getAllProducts(
  query?: PaginationQuery
): Promise<PaginatedResult<Product> | Product[]>;
export async function getAllProducts(
  query?: PaginationQuery
): Promise<PaginatedResult<Product> | Product[]> {
  const where: Prisma.ProductWhereInput = {};

  if (query?.category) {
    where.category = { equals: query.category };
  }

  if (typeof query?.isAvailable === 'boolean') {
    where.isAvailable = query.isAvailable;
  }

  if (query?.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  if (query?.page !== undefined && query?.limit !== undefined) {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetches a single product by its unique ID. Returns null if not found.
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { id },
  });
};

/**
 * Updates a product by ID. Catches Prisma error code P2025 (record not found) and returns null.
 */
export const updateProduct = async (
  id: string,
  data: UpdateProductInput
): Promise<Product | null> => {
  try {
    return await prisma.product.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return null;
    }
    throw error;
  }
};

/**
 * Deletes a product by ID. Catches Prisma error code P2025 (record not found) and returns false,
 * or true upon successful deletion.
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return false;
    }
    throw error;
  }
};
