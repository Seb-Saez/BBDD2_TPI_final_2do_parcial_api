
import Product from '../model/Product.js';
import Review from '../model/Review.js';
import User from '../model/User.js';
import { verifyHeaderTokenAndVerify, verifyRoleDecoded } from '../services/token.js';

class ProductController {
    async getAll(req, res) {
        try{
            const products = await Product.find().select('-__v -createdAt -updatedAt -_id');
            res.status(200).send({ products: products });
        }catch (error) {
            res.status(500).send(`Error fetching products: ${error.message}`);
        }
    }
    async getById(req, res) {
        try{
            const { id } = req.params;
            const product = await Product.findById(id).select('-__v -createdAt -updatedAt');
            if (!product) return res.status(404).send("Product not found");
            res.status(200).send({ product });
        }catch (error) {
            res.status(500).send(`Error fetching product: ${error.message}`);
        }
    }
    async create(req, res) {
        try{
            const headers = req.headers['authorization'];
            if (!headers) return res.status(401).send("Unauthorized");
            const verified = verifyHeaderTokenAndVerify(headers);
            if (!verified) return res.status(401).send("Unauthorized");
            if (!verifyRoleDecoded('ADMIN', verified)) return res.status(403).send("Access denied");
            const {nombre,precio,descripcion,stock,marca,reviews,categoria} = req.body;
            if(!nombre || !precio || !stock || !marca) return res.status(400).send("Faltan datos obligatorios");
            if (isNaN(precio) || isNaN(stock)) return res.status(400).send("Precio y Stock deben ser numeros");
            if(precio < 0 || stock < 0) return res.status(400).send("Precio y Stock deben ser mayores o iguales a 0");

            if(!descripcion) descripcion = "Sin descripción";
            if(!reviews) reviews = [];
            if(!categoria) categoria = null;
        
            const newProduct = await Product.create({
                nombre,
                precio,
                descripcion,
                stock,
                marca,
                reviews,
                categoria
            });
            res.status(201).send({ product: newProduct });
        } catch (error) {
            res.status(500).send(`Error creating product: ${error.message}`);
        }
    }
    async update(req, res) {
        try{
            const headers = req.headers['authorization'];
            if (!headers) return res.status(403).send("Unauthorized");
            const verified = verifyHeaderTokenAndVerify(headers);
            if (!verified) return res.status(403).send("Unauthorized");
            if (verified.rol !== 'ADMIN') return res.status(403).send("Unauthorized");
            const { id } = req.params;
            const {nombre,precio,descripcion,stock,marca,categoria} = req.body;
            const updateData = {};
            if(nombre) updateData.nombre = nombre;
            if(precio){
                if(isNaN(precio) || precio < 0) return res.status(400).send("Precio debe ser un número mayor o igual a 0");
                updateData.precio = precio;
            }
            if(descripcion) updateData.descripcion = descripcion;
            if(stock){
                if(isNaN(stock) || stock < 0) return res.status(400).send("Stock debe ser un número mayor o igual a 0");
                updateData.stock = stock;
            }
            if(marca) updateData.marca = marca;
            if(categoria) updateData.categoria = categoria;

            const updatedProduct = await Product.findByIdAndUpdate(id, {
                $set: updateData
            }, { new: true });
            if (!updatedProduct) return res.status(404).send("Product not found");
            res.status(200).send({ updatedProduct });
        }catch (error) {
            res.status(500).send(`Error updating product: ${error.message}`);
        }
    }
    async delete(req, res) {
        try{
            const headers = req.headers['authorization'];
            if (!headers) return res.status(403).send("Unauthorized");
            const verified = verifyHeaderTokenAndVerify(headers);
            if (!verified) return res.status(403).send("Unauthorized");
            if (verified.rol !== 'ADMIN') return res.status(403).send("Unauthorized");
            const { id } = req.params;
            const reviews = await Review.find({ producto: id });
            if(reviews.length>0){
                const deletedReviews = await Review.deleteMany({ producto: id });
            }
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) return res.status(404).send("Product not found");
            res.status(200).send({ message: "Product deleted successfully" });
        }catch (error) {
            res.status(500).send(`Error deleting product: ${error.message}`);
        }
    }
    async filterProducts(req, res) {
        try {
            const { precioMin, precioMax, marca } = req.query;
            const filter = {};
            /**
             * Limitacion de queryes, preguntar al profe
             */
            if (!precioMin) return res.status(400).send("precioMin must be a number");
            if (!precioMax) return res.status(400).send("precioMax must be a number");
            if (precioMin) filter.precio = { $gte: Number(precioMin) };
            if (precioMax) filter.precio = { ...filter.precio, $lte: Number(precioMax) };
            if (marca) filter.marca = marca;
            const products = await Product.find(filter)
            res.status(200).send({ products });
        } catch (error) {
            res.status(500).send(`Error filtering products: ${error.message}`);
        }
    }
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { stock } = req.body;
            if (stock == null || isNaN(stock)) {
                return res.status(400).send("Error in updating stock");
            }
            const updatedProduct = await Product.findByIdAndUpdate(id, {
                $set: { stock }
            }, { new: true });
            if (!updatedProduct) {
                return res.status(404).send("Error in updating stock");
            }
            res.status(200).send({ product: updatedProduct });
        } catch (error) {
            res.status(500).send(`${error.message}`);
        }
    }
    async getTopProducts(req, res) {
        try {
            const productsAggregate = await Product.aggregate([
                {
                    $match: {
                        reviews: { $exists: true, $ne: [] }
                    },
                }, {
                    $addFields: {
                        cantidadReseñas: { $size: "$reviews" }
                    }
                },{
                    $sort: { cantidadReseñas: -1 }
                },{
                    $limit: 10
                },{
                    $lookup: {
                        from: "reviews",
                        localField: "reviews",
                        foreignField: "_id",
                        as: "detallesReseñas",
                        pipeline:[
                            {
                                $project:{
                                    _id:0,
                                    _v:0,
                                }
                            }
                        ]
                    }
                }
            ])
            res.status(200).send({ productsAggregate });
        } catch (error) {
            res.status(500).send(`Error fetching top products: ${error.message}`);
        }
    }
}

export default new ProductController();