import Review from '../model/Review.js';
import User from '../model/User.js';
class ReviewController{

    /**
     * Crear una nueva reseña
     * @param {Object} req - La solicitud HTTP
     * @param {Object} res - La respuesta HTTP
     * @return {Object} - La respuesta JSON con el estado de la creación de la reseña
     * @throws {Error} - Si ocurre un error al crear la reseña
     */
    async create(req, res) {
        /**
         * @function create
         * @description Crea una nueva reseña en la base de datos
         * @param {Object} req - Objeto de solicitud HTTP que contiene los datos de la reseña
         * @param {Object} res - Objeto de respuesta HTTP para enviar la respuesta al cliente
         * @returns {Object} - Respuesta JSON con el estado de la creación de la reseña
         * @throws {Error} - Si ocurre un error al crear la reseña
         * 
         * 
        */
        const { userId, productId, calificacion, comentario } = req.body;
        /**
         * @param {String} userId - ID del usuario que crea la reseña
         * @param {String} productId - ID del producto que se está reseñando
         * @param {Number} calificacion - Calificación otorgada al producto (1-5)
         * @param {String} comentario - Comentario adicional sobre el producto
         */
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
                res.status(200).json({ message: 'Review created successfully', review: newReview });
            } catch (error) {
                res.status(500).json({ error: `Error creating review: ${error.message}` });
            }
        }else{
            res.status(404).json({ error: `Error: ${error.message}`});
        }
    }
    async getAll(req, res) {
        try{
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "Error in fetching reviews" });
            //Extraer token
            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).json({ error: "Error in fetching reviews" });
            //Verificar token
            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).json({ error: "Error in fetching reviews" });
            //Verificar Administrador
            if (verified.rol !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
            const reviews = await Review.find()
            res.status(200).json({ reviews });
        }catch(error){
            res.status(500).json({ error: `${error.message}` });
        }
    }
    async getById(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) return res.status(404).json({ error: "Review not found" });
            res.status(200).json({ review });
        } catch (error) {
            res.status(500).json({ error: `Error fetching review: ${error.message}` });
        }
    }
    async delete(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "Error in deleting review" });
            //Extraer token
            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).json({ error: "Error in deleting review" });
            //Verificar token
            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).json({ error: "Error in deleting review" });
            //Verificar Administrador
            if (verified.id !== req.params.id) return res.status(403).json({ error: "Access denied" });
            const review = await Review.findByIdAndDelete(req.params.id);
            if (!review) return res.status(404).json({ error: "Review not found" });
            res.status(200).json({ message: "Review deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: `Error deleting review: ${error.message}` });
        }
    }
    async update(req, res) {
        try {
            const token = req.headers['authorization'];
            if (!token) return res.status(401).json({ error: "Error in updating review" });
            //Extraer token
            const extractedToken = extractToken(token);
            if (!extractedToken) return res.status(401).json({ error: "Error in updating review" });
            //Verificar token
            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).json({ error: "Error in updating review" });
            
            // Verificar que la reseña existe
            const existingReview = await Review.findById(req.params.id);
            if (!existingReview) return res.status(404).json({ error: "Review not found" });
            
            // Verificar que el usuario es el propietario de la reseña
            if (existingReview.usuario !== verified.id) {
                return res.status(403).json({ error: "Access denied - You can only update your own reviews" });
            }
            
            const { calificacion, comentario } = req.body;
            const review = await Review.findByIdAndUpdate(
                req.params.id,
                { calificacion, comentario },
                { new: true }
            );
            
            res.status(200).json({ message: "Review updated successfully", review });
        } catch (error) {
            res.status(500).json({ error: `Error updating review: ${error.message}` });
        }
    }
}   

export default new ReviewController();