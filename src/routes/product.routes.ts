import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
} from '../schemas/product.schema';

const router = Router();

router.post('/', validate(createProductSchema), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.patch('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
