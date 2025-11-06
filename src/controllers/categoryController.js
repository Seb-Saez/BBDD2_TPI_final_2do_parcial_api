import Category from '../model/Category.js';
import { verifyHeaderTokenAndVerify } from '../services/token.js';
class CategoryController {
    async getAll(req, res) {
        try {
            const categories = await Category.find().select('-__v -createdAt -updatedAt ');
            res.status(200).send({ categories });
        } catch (error) {
            res.status(500).send(`Error fetching categories: ${error.message}`);
        }
    }
    async getById(req, res) {
        try {
            const category = await Category.findById(req.params.id).select('-__v -createdAt -updatedAt ');
            if (!category) return res.status(404).send("Category not found");
            res.status(200).send({ category });
        } catch (error) {
            res.status(500).send(`Error fetching category: ${error.message}`);
        }
    }
    async create(req, res) {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).send("Unauthorized");
        //Extraer token
        const verified = verifyHeaderTokenAndVerify(header);
        if (!verified) return res.status(401).send("Unauthorized");
        if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
        try {
            const { nombre, descripcion } = req.body;
            if (!nombre) return res.status(400).send("Missing required fields");
            const newCategory = await Category.create({
                nombre,
                descripcion: descripcion || "Sin descripción"
            });
            res.status(201).send({ category: newCategory });
        } catch (error) {
            res.status(500).send(`Error creating category: ${error.message}`);
        }
    }
    async update(req, res) {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).send("Unauthorized");
        //Extraer token
        const verified = verifyHeaderTokenAndVerify(header);
        if (!verified) return res.status(401).send("Unauthorized");
        if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;
            const updatedCategory = {};

            if (nombre) updatedCategory.nombre = nombre;
            if (descripcion) updatedCategory.descripcion = descripcion;
            const category = await Category.findByIdAndUpdate(id, updatedCategory, { new: true });
            if (!category) return res.status(404).send("Category not found");
            res.status(200).send({ category });
        } catch (error) {
            res.status(500).send(`Error updating category: ${error.message}`);
        }
    }
    async delete(req, res) {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).send("Unauthorized");
        //Extraer token
        const verified = verifyHeaderTokenAndVerify(header);
        if (!verified) return res.status(401).send("Unauthorized");
        if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
        try {
            const { id } = req.params;
            const category = await Category.findByIdAndDelete(id);
            if (!category) return res.status(404).send("Category not found");
            res.status(200).send({ message: "Category deleted successfully" });
        } catch (error) {
            res.status(500).send(`Error deleting category: ${error.message}`);
        }
    }
    async getCategoryStats(req, res) {
        try {
            const categoriesAggregate = await Category.aggregate([
                {
                    $match: {
                        productos: { $exists: true, $ne: [] }
                    },
                },
                {
                    $addFields: {
                        cantidadProductos: { $size: "$productos" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        nombre: 1,
                        cantidadProductos: 1
                    }
                }
            ]);
            res.status(200).send({ categoriesStats: categoriesAggregate });
        } catch (error) {
            res.status(500).send(`Error fetching category stats: ${error.message}`);
        }
    }
}

export default new CategoryController();