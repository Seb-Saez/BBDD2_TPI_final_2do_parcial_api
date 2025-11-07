import express from 'express';
import cartController from '../controllers/cartController.js';

const router = express.Router();

router.post('/', cartController.create);
router.get('/user/:id', cartController.getCartByUser);
router.get('/', cartController.getAll);
router.get('/:id', cartController.getById);
router.put('/:id', cartController.update);
router.delete('/:id', cartController.delete);
router.get('/:usuarioId/total', cartController.getCartTotal);


export default router;