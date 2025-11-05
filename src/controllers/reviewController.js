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
                res.status(201).json({ message: 'Review created successfully', review: newReview });
            } catch (error) {
                res.status(500).json({ error: `Error creating review: ${error.message}` });
            }
        }else{
            res.status(404).json({ error: `Error: ${error.message}`});
        }
    }
    async getAll(req, res) {
        try{
            const reviews = await Review.find()
        }catch(error){
            res.status(500).json({ error: `${error.message}` });
        }
    }
}

export default new ReviewController();