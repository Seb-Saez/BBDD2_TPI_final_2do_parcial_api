import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get('/filtro', productController.filterProducts);
router.get('/top', productController.getTopProducts);
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.patch('/:id/stock', productController.updateStock);
router.delete('/:id', productController.delete);

export default router;