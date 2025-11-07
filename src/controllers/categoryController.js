import Category from '../model/Category.js';
import { verifyHeaderTokenAndVerify } from '../services/token.js';

class CategoryController {
    async getAll(req, res) {
        try {
            const categories = await Category.find().select('-__v -createdAt -updatedAt');
            res.status(200).json({ mensaje: "Categorías obtenidas correctamente", categorias: categories });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener categorías: ${error.message}` });
        }
    }

    async getById(req, res) {
        try {
            const category = await Category.findById(req.params.id).select('-__v -createdAt -updatedAt');
            if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });
            res.status(200).json({ mensaje: "Categoría encontrada", categoria: category });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener la categoría: ${error.message}` });
        }
    }

    async create(req, res) {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ mensaje: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (!verified) return res.status(401).json({ mensaje: "Token inválido o expirado" });
        if (verified.rol !== 'ADMIN') return res.status(403).json({ mensaje: "Acceso denegado" });

        try {
            const { nombre, descripcion } = req.body;
            if (!nombre) return res.status(400).json({ mensaje: "El campo 'nombre' es obligatorio" });

            const newCategory = await Category.create({
                nombre,
                descripcion: descripcion || "Sin descripción"
            });

            res.status(201).json({ mensaje: "Categoría creada correctamente", categoria: newCategory });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al crear la categoría: ${error.message}` });
        }
    }

    async update(req, res) {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ mensaje: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (!verified) return res.status(401).json({ mensaje: "Token inválido o expirado" });
        if (verified.rol !== 'ADMIN') return res.status(403).json({ mensaje: "Acceso denegado" });

        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;
            const updatedCategory = {};

            if (nombre) updatedCategory.nombre = nombre;
            if (descripcion) updatedCategory.descripcion = descripcion;

            const category = await Category.findByIdAndUpdate(id, updatedCategory, { new: true });
            if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });

            res.status(200).json({ mensaje: "Categoría actualizada correctamente", categoria: category });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al actualizar la categoría: ${error.message}` });
        }
    }

    async delete(req, res) {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ mensaje: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (!verified) return res.status(401).json({ mensaje: "Token inválido o expirado" });
        if (verified.rol !== 'ADMIN') return res.status(403).json({ mensaje: "Acceso denegado" });

        try {
            const { id } = req.params;
            const category = await Category.findByIdAndDelete(id);
            if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });

            res.status(200).json({ mensaje: "Categoría eliminada correctamente" });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al eliminar la categoría: ${error.message}` });
        }
    }

    async getCategoryStats(req, res) {
        try {
            const categoriesAggregate = await Category.aggregate([
                {
                    $match: { productos: { $exists: true, $ne: [] } },
                },
                {
                    $addFields: { cantidadProductos: { $size: "$productos" } }
                },
                {
                    $project: { _id: 0, nombre: 1, cantidadProductos: 1 }
                }
            ]);

            res.status(200).json({
                mensaje: "Estadísticas de categorías obtenidas correctamente",
                estadisticas: categoriesAggregate
            });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener estadísticas: ${error.message}` });
        }
    }
}

export default new CategoryController();
