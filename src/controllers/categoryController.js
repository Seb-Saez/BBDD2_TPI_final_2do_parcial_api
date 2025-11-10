import Category from '../model/Category.js';

class CategoryController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los métodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincrónicas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    /**
     * Obtener todas las categorías.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getAll(req, res) {
        try {
            const categories = await Category.find().select('-__v -createdAt -updatedAt');
            res.status(200).json({ mensaje: "Categorías obtenidas correctamente", categorias: categories });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener categorías: ${error.message}` });
        }
    }

    /**
     * Obtener una categoría específica por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getById(req, res) {
        try {
            const category = await Category.findById(req.params.id).select('-__v -createdAt -updatedAt');
            if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });
            res.status(200).json({ mensaje: "Categoría encontrada", categoria: category });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener la categoría: ${error.message}` });
        }
    }

    /**
     * Crear una nueva categoría.
     * El campo 'nombre' es obligatorio.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async create(req, res) {
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

    /**
     * Actualizar una categoría existente.
     * Actualiza solo los campos proporcionados en el cuerpo de la solicitud.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async update(req, res) {
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

    /**
     * Eliminar una categoría por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByIdAndDelete(id);
            if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });

            res.status(200).json({ mensaje: "Categoría eliminada correctamente" });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al eliminar la categoría: ${error.message}` });
        }
    }

    /**
     * Obtener estadísticas de categorías.
     * Retorna el conteo de productos por cada categoría.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
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
