import express from 'express';

import orderController from '../controllers/orderController.js';
import { authenticate, adminAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, orderController.create);
router.get('/stats', adminAuthenticate, orderController.getOrdersByState);
router.get('/', adminAuthenticate, orderController.getAll);
router.get('/:id', authenticate, orderController.getById);
router.patch('/:id/status', adminAuthenticate, orderController.update);
router.delete('/:id', adminAuthenticate, orderController.delete);
router.get("/user/:userId", authenticate, orderController.getOrdersByUserId);

export default router;