import express from 'express';
import categoryController from '../controllers/categoryController.js';
import { adminAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', categoryController.getCategoryStats);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', adminAuthenticate, categoryController.create);
router.put('/:id', adminAuthenticate, categoryController.update);
router.delete('/:id', adminAuthenticate, categoryController.delete);

export default router;