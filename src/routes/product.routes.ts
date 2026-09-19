import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productQuerySchema,
} from '../schemas/product.schema';

const router = Router();

router
  .route('/')
  .get(validate({ query: productQuerySchema }), productController.getProducts)
  .post(validate({ body: createProductSchema }), productController.createProduct);

router
  .route('/:id')
  .get(validate({ params: productIdParamSchema }), productController.getProductById)
  .put(
    validate({ params: productIdParamSchema, body: updateProductSchema }),
    productController.updateProduct
  )
  .patch(
    validate({ params: productIdParamSchema, body: updateProductSchema }),
    productController.updateProduct
  )
  .delete(validate({ params: productIdParamSchema }), productController.deleteProduct);

export default router;
