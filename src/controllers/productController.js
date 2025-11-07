import Category from '../model/Category.js';
import Product from '../model/Product.js';
import Review from '../model/Review.js';
import User from '../model/User.js';
import { verifyHeaderTokenAndVerify, verifyRoleDecoded } from '../services/token.js';

class ProductController {
    async getAll(req, res) {
        try {
            const products = await Product.find().select('-__v -createdAt -updatedAt');
            res.status(200).json({ productos: products });
        } catch (error) {
            res.status(500).json({ mensaje: `Error al obtener los productos: ${error.message}` });
        }
    }

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

    async create(req, res) {
        try {
            const headers = req.headers['authorization'];
            if (!headers) return res.status(401).json({ mensaje: "No autorizado" });
            const verified = verifyHeaderTokenAndVerify(headers);
            if (!verified) return res.status(401).json({ mensaje: "No autorizado" });
            if (!verifyRoleDecoded('ADMIN', verified)) return res.status(403).json({ mensaje: "Acceso denegado" });

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

    async update(req, res) {
        try {
            const headers = req.headers['authorization'];
            if (!headers) return res.status(403).json({ mensaje: "No autorizado" });
            const verified = verifyHeaderTokenAndVerify(headers);
            if (!verified) return res.status(403).json({ mensaje: "No autorizado" });
            if (verified.rol !== 'ADMIN') return res.status(403).json({ mensaje: "No autorizado" });

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

    async delete(req, res) {
        try {
            const headers = req.headers['authorization'];
            if (!headers) return res.status(403).json({ mensaje: "No autorizado" });
            const verified = verifyHeaderTokenAndVerify(headers);
            if (!verified) return res.status(403).json({ mensaje: "No autorizado" });
            if (verified.rol !== 'ADMIN') return res.status(403).json({ mensaje: "No autorizado" });

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
