import Review from '../model/Review.js';
import User from '../model/User.js';
class ReviewController{
    async create(req, res) {
        const { userId, productId, calificacion, comentario } = req.body;
        const userExist = await User.findById(userId);
        const productExist = await Product.findById(productId);
        if (productExist && userExist) {
            const review = {
                usuario: userId,
                producto: productId,
                calificacion: calificacion,
                comentario: comentario
            };
            try {
                const newReview = await Review.create(review);
                res.status(201).json({ message: 'Review created successfully', review: newReview });
            } catch (error) {
                res.status(500).json({ error: `Error creating review: ${error.message}` });
            }
        }else{
            res.status(404).json({ error: 'User or Product not found' });
        }
    }
}

export default new ReviewController();