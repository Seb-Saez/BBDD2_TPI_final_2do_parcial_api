import express from 'express';

import orderController from '../controllers/orderController.js';

const router = express.Router();

router.post('/', orderController.create);
router.get('/stats', orderController.getOrdersByState);
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.patch('/:id/status', orderController.update);
router.delete('/:id', orderController.delete);
router.get("/user/:userId", orderController.getOrdersByUserId);

export default router;