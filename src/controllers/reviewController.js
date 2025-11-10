import Review from '../model/Review.js';
import User from '../model/User.js';
import Product from '../model/Product.js';

class ReviewController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los métodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincrónicas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    /**
     * Crear una nueva reseña de producto.
     * Verifica que el usuario y el producto existan antes de crear la reseña.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
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
                await Product.findByIdAndUpdate(productId, { $push: { reviews: newReview._id } });
                res.status(200).json({
                    mensaje: "Reseña creada correctamente",
                    reseña: newReview
                });
            } catch (error) {
                res.status(500).json({ mensaje: `Error al crear la reseña: ${error.message}` });
            }
        } else {
            res.status(404).json({ mensaje: "Usuario o producto no encontrado" });
        }
    }

    /**
     * Obtener todas las reseñas (solo admin).
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getAll(req, res) {
        try {
            const reviews = await Review.find().populate({
                path: 'usuario',
                select: 'nombre -_id'
            }).populate({
                path: 'producto',
                select: 'nombre -_id'
            }).select('-__v -createdAt -updatedAt');
            res.status(200).json({
                mensaje: "Reseñas obtenidas correctamente",
                reseñas: reviews
            });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener reseñas: ${error.message}` });
        }
    }

    /**
     * Obtener una reseña específica por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getById(req, res) {
        try {
            const review = await Review.findById(req.params.id).populate({
                path: 'usuario',
                select: 'nombre -_id'
            }).populate({
                path: 'producto',
                select: 'nombre -_id'
            }).select('-__v -createdAt -updatedAt');
            if (!review) return res.status(404).json({ mensaje: "Reseña no encontrada" });
            res.status(200).json({
                mensaje: "Reseña encontrada",
                reseña: review
            });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener reseña: ${error.message}` });
        }
    }

    /**
     * Eliminar una reseña por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async delete(req, res) {
        try {
            const review = await Review.findByIdAndDelete(req.params.id);
            if (!review) return res.status(404).json({ mensaje: "Reseña no encontrada" });

            res.status(200).json({ mensaje: "Reseña eliminada correctamente" });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al eliminar reseña: ${error.message}` });
        }
    }

    /**
     * Actualizar una reseña existente.
     * Solo el usuario que creó la reseña puede modificarla.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async update(req, res) {
        try {
            const existingReview = await Review.findById(req.params.id);
            if (!existingReview) return res.status(404).json({ mensaje: "Reseña no encontrada" });

            // Verificar que el usuario autenticado sea el dueño de la reseña
            if (existingReview.usuario.toString() !== req.user.id) {
                return res.status(403).json({ mensaje: "Acceso denegado: solo puedes modificar tus propias reseñas" });
            }

            const { calificacion, comentario } = req.body;
            const review = await Review.findByIdAndUpdate(
                req.params.id,
                { calificacion, comentario },
                { new: true }
            );

            res.status(200).json({
                mensaje: "Reseña actualizada correctamente",
                reseña: review
            });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al actualizar reseña: ${error.message}` });
        }
    }
}

export default new ReviewController();
