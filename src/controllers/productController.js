import Category from '../model/Category.js';
import Product from '../model/Product.js';
import Review from '../model/Review.js';
import User from '../model/User.js';

class ProductController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los métodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincrónicas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    /**
     * Obtener todos los productos.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getAll(req, res) {
        try {
            const products = await Product.find().select('-__v -createdAt -updatedAt');
            res.status(200).json({ productos: products });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener los productos: ${error.message}` });
        }
    }

    /**
     * Obtener un producto específico por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id).select('-__v -createdAt -updatedAt');
            if (!product) return res.status(404).json({ mensaje: "Producto no encontrado" });
            res.status(200).json({ producto: product });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener el producto: ${error.message}` });
        }
    }

    /**
     * Crear un nuevo producto.
     * Valida datos obligatorios y asocia el producto a una categoría si se proporciona.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async create(req, res) {
        try {
            let { nombre, precio, descripcion, stock, marca, reviews, categoria } = req.body;
            if (!nombre || !precio || !stock || !marca) return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
            if (isNaN(precio) || isNaN(stock)) return res.status(400).json({ mensaje: "El precio y el stock deben ser números" });
            if (precio < 0 || stock < 0) return res.status(400).json({ mensaje: "El precio y el stock deben ser mayores o iguales a 0" });

            if (!descripcion) descripcion = "Sin descripción";
            if (!reviews) reviews = [];
            if (!categoria) categoria = null;

            const newProduct = { nombre, precio, descripcion, stock, marca, reviews, categoria };
            const createdProduct = await Product.create(newProduct);

            if (categoria) {
                const categoryExists = await Category.findById(categoria);
                if (!categoryExists) return res.status(400).json({ mensaje: "La categoría no existe" });
                categoryExists.productos.push({ producto_id: createdProduct._id });
                await categoryExists.save();
            }

            res.status(201).json({ mensaje: "Producto creado correctamente", producto: createdProduct });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al crear el producto: ${error.message}` });
        }
    }

    /**
     * Actualizar un producto existente.
     * Actualiza solo los campos proporcionados en el cuerpo de la solicitud.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, precio, descripcion, stock, marca, categoria } = req.body;

            const updateData = {};
            if (nombre) updateData.nombre = nombre;
            if (precio) {
                if (isNaN(precio) || precio < 0) return res.status(400).json({ mensaje: "El precio debe ser un número mayor o igual a 0" });
                updateData.precio = precio;
            }
            if (descripcion) updateData.descripcion = descripcion;
            if (stock) {
                if (isNaN(stock) || stock < 0) return res.status(400).json({ mensaje: "El stock debe ser un número mayor o igual a 0" });
                updateData.stock = stock;
            }
            if (marca) updateData.marca = marca;
            if (categoria) updateData.categoria = categoria;

            const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            if (!updatedProduct) return res.status(404).json({ mensaje: "Producto no encontrado" });

            res.status(200).json({ mensaje: "Producto actualizado correctamente", productoActualizado: updatedProduct });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al actualizar el producto: ${error.message}` });
        }
    }

    /**
     * Eliminar un producto por su ID.
     * También elimina todas las reseñas asociadas al producto.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const reviews = await Review.find({ producto: id });
            if (reviews.length > 0) await Review.deleteMany({ producto: id });

            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) return res.status(404).json({ mensaje: "Producto no encontrado" });

            res.status(200).json({ mensaje: "Producto eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al eliminar el producto: ${error.message}` });
        }
    }

    /**
     * Filtrar productos por rango de precio y marca.
     * Requiere precioMin y precioMax como parámetros de query.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async filterProducts(req, res) {
        try {
            const { precioMin, precioMax, marca } = req.query;
            const filter = {};

            if (!precioMin) return res.status(400).json({ mensaje: "precioMin debe ser un número" });
            if (!precioMax) return res.status(400).json({ mensaje: "precioMax debe ser un número" });

            if (precioMin) filter.precio = { $gte: Number(precioMin) };
            if (precioMax) filter.precio = { ...filter.precio, $lte: Number(precioMax) };
            if (marca) filter.marca = marca;

            const products = await Product.find(filter);
            res.status(200).json({ productosFiltrados: products });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al filtrar productos: ${error.message}` });
        }
    }

    /**
     * Actualizar el stock de un producto.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { stock } = req.body;
            if (stock == null || isNaN(stock)) {
                return res.status(400).json({ mensaje: "Error al actualizar el stock: valor inválido" });
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, { $set: { stock } }, { new: true });
            if (!updatedProduct) {
                return res.status(404).json({ mensaje: "Error al actualizar el stock: producto no encontrado" });
            }

            res.status(200).json({ mensaje: "Stock actualizado correctamente", producto: updatedProduct });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al actualizar el stock: ${error.message}` });
        }
    }

    /**
     * Obtener los 10 productos más destacados.
     * Ordena productos por cantidad de reseñas en orden descendente.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getTopProducts(req, res) {
        try {
            const productsAggregate = await Product.aggregate([
                { $match: { reviews: { $exists: true, $ne: [] } } },
                { $addFields: { cantidadReseñas: { $size: "$reviews" } } },
                { $sort: { cantidadReseñas: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "reviews",
                        localField: "reviews",
                        foreignField: "_id",
                        as: "detallesReseñas",
                        pipeline: [{ $project: { _id: 0, _v: 0 } }]
                    }
                }
            ]);
            res.status(200).json({ productosDestacados: productsAggregate });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener los productos destacados: ${error.message}` });
        }
    }
}

export default new ProductController();
