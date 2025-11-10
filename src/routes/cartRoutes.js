import express from 'express';
import cartController from '../controllers/cartController.js';
import { authenticate, adminAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, cartController.create);
router.get('/user/:id', authenticate, cartController.getCartByUser);
router.get('/', adminAuthenticate, cartController.getAll);
router.get('/:id', authenticate, cartController.getById);
router.put('/:id', authenticate, cartController.update);
router.delete('/:id', authenticate, cartController.delete);
router.get('/:usuarioId/total', authenticate, cartController.getCartTotal);


export default router;