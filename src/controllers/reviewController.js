import Review from '../model/Review.js';
import User from '../model/User.js';
import Product from '../model/Product.js';
import { extractToken, verifyToken } from '../services/token.js';

class ReviewController {

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

    async getAll(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ mensaje: "No autorizado" });

            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).json({ mensaje: "Token inválido" });

            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).json({ mensaje: "Token inválido o expirado" });

            if (verified.rol !== 'ADMIN') return res.status(403).json({ mensaje: "Acceso denegado" });

            const reviews = await Review.find();
            res.status(200).json({
                mensaje: "Reseñas obtenidas correctamente",
                reseñas: reviews
            });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener reseñas: ${error.message}` });
        }
    }

    async getById(req, res) {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) return res.status(404).json({ mensaje: "Reseña no encontrada" });
            res.status(200).json({
                mensaje: "Reseña encontrada",
                reseña: review
            });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener reseña: ${error.message}` });
        }
    }

    async delete(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ mensaje: "No autorizado" });

            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).json({ mensaje: "Token inválido" });

            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).json({ mensaje: "Token inválido o expirado" });


            const review = await Review.findByIdAndDelete(req.params.id);
            if (!review) return res.status(404).json({ mensaje: "Reseña no encontrada" });

            res.status(200).json({ mensaje: "Reseña eliminada correctamente" });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al eliminar reseña: ${error.message}` });
        }
    }

    async update(req, res) {
        try {
            const token = req.headers['authorization'];
            if (!token) return res.status(401).json({ mensaje: "No autorizado" });

            const extractedToken = extractToken(token);
            if (!extractedToken) return res.status(401).json({ mensaje: "Token inválido" });

            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).json({ mensaje: "Token inválido o expirado" });

            const existingReview = await Review.findById(req.params.id);
            if (!existingReview) return res.status(404).json({ mensaje: "Reseña no encontrada" });

            if (existingReview.usuario.toString() !== verified.id) {
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
