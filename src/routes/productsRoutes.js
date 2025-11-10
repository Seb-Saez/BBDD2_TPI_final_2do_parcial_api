import express from 'express';
import productController from '../controllers/productController.js';
import { adminAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/filtro', productController.filterProducts);
router.get('/top', productController.getTopProducts);
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', adminAuthenticate, productController.create);
router.put('/:id', adminAuthenticate, productController.update);
router.patch('/:id/stock', adminAuthenticate, productController.updateStock);
router.delete('/:id', adminAuthenticate, productController.delete);

export default router;