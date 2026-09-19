import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe('Product Integration Tests (/api/products)', () => {
  // Test 1: Empty state
  it('GET /api/products - should return 200 OK and an empty array when no products exist', async () => {
    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test 2: Validation failures
  it('POST /api/products - should return 400 Bad Request on invalid payloads', async () => {
    // Missing required fields
    const missingFieldsRes = await request(app).post('/api/products').send({
      name: 'Incomplete Item',
    });

    expect(missingFieldsRes.status).toBe(400);
    expect(missingFieldsRes.body.error).toBe(true);
    expect(missingFieldsRes.body.message).toBe('Validation failed');
    expect(Array.isArray(missingFieldsRes.body.errors)).toBe(true);

    // Negative price and negative stock
    const negativeValuesRes = await request(app).post('/api/products').send({
      name: 'Invalid Values Item',
      price: -50,
      stock: -5,
      category: 'Test',
      description: 'Item with negative price and stock',
    });

    expect(negativeValuesRes.status).toBe(400);
    expect(negativeValuesRes.body.error).toBe(true);
    expect(negativeValuesRes.body.message).toBe('Validation failed');
  });

  // Test 3: Full CRUD Lifecycle
  it('Full CRUD Lifecycle - should create, read, update, and delete a product', async () => {
    // Step A: Create Product
    const newProduct = {
      name: 'Macky Plushie',
      price: 350.0,
      stock: 25,
      category: 'Collectibles',
      description: 'Limited edition Macky plushie doll',
      isAvailable: true,
    };

    const createRes = await request(app).post('/api/products').send(newProduct);
    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe(newProduct.name);
    expect(createRes.body.price).toBe(newProduct.price);
    expect(createRes.body.stock).toBe(newProduct.stock);

    const productId = createRes.body.id;

    // Step B: Get Product by ID
    const getRes = await request(app).get(`/api/products/${productId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(productId);
    expect(getRes.body.name).toBe(newProduct.name);
    expect(getRes.body.description).toBe(newProduct.description);

    // Step C: Update Product
    const updateData = {
      price: 399.99,
      stock: 18,
    };

    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .send(updateData);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.id).toBe(productId);
    expect(updateRes.body.price).toBe(updateData.price);
    expect(updateRes.body.stock).toBe(updateData.stock);

    // Step D: Delete Product
    const deleteRes = await request(app).delete(`/api/products/${productId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({
      message: 'Product deleted successfully.',
    });

    // Step E: Subsequent GET returns 404
    const notFoundRes = await request(app).get(`/api/products/${productId}`);
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body).toEqual({
      error: true,
      message: 'Product not found.',
    });
  });

  // Test 4: Pagination Bonus & Headers
  it('GET /api/products?page=1&limit=2 - should paginate and include pagination headers', async () => {
    // Pre-populate 3 items
    await prisma.product.createMany({
      data: [
        {
          name: 'Item 1',
          price: 100,
          stock: 10,
          category: 'Stationery',
          description: 'Notebook 1',
        },
        {
          name: 'Item 2',
          price: 200,
          stock: 20,
          category: 'Stationery',
          description: 'Notebook 2',
        },
        {
          name: 'Item 3',
          price: 300,
          stock: 30,
          category: 'Stationery',
          description: 'Notebook 3',
        },
      ],
    });

    const response = await request(app).get('/api/products?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);

    // Assert custom pagination headers
    expect(response.headers['x-total-count']).toBe('3');
    expect(response.headers['x-page']).toBe('1');
    expect(response.headers['x-limit']).toBe('2');
    expect(response.headers['x-total-pages']).toBe('2');
  });

  // Test 5: 404 Edge Cases
  it('404 Edge Cases - should return 404 for non-existent IDs on GET and DELETE', async () => {
    const nonExistentId = 'non-existent-id';

    const getRes = await request(app).get(`/api/products/${nonExistentId}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body).toEqual({
      error: true,
      message: 'Product not found.',
    });

    const deleteRes = await request(app).delete(`/api/products/${nonExistentId}`);
    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body).toEqual({
      error: true,
      message: 'Product not found.',
    });
  });
});
