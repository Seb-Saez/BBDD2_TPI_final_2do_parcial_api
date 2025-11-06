import Cart from '../model/Cart.js';
import User from '../model/User.js';
import { verifyRoleDecoded } from '../services/token.js';


class CartController {
    async create(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verifyRoleDecoded(verified.rol)) return res.status(403).send("Access denied");
            const { userId } = req.body;
            if (!userId) return res.status(400).send("Missing required fields");
            const userExist = await User.findById(userId);
            if (!userExist) return res.status(404).send("User not found");
            const cartExist = await Cart.findOne({ usuario: userId });
            if (cartExist) return res.status(400).send("Cart already exists for this user");
            const newCart = await Cart.create({
                usuario: userId,
                productos: []
            });
            res.status(201).send({ cart: newCart });
        } catch (error) {
            res.status(500).send(`Error creating cart: ${error.message}`);
        }
    }
    async update(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verifyRoleDecoded(verified.rol)) return res.status(403).send("Access denied");
            const { id } = req.params;
            const { producto, cantidad } = req.body;
            const cart = await Cart.findById(id);
            if (!cart) return res.status(404).send("Cart not found");
            await Cart.findByIdAndUpdate(id, { $push: { productos: { product: producto, cantidad: cantidad } } });
            res.status(200).send({ cart });
        } catch (error) {
            res.status(500).send(`Error adding products to cart: ${error.message}`);
        }
    }
    async delete(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verifyRoleDecoded(verified.rol)) return res.status(403).send("Access denied");
            const { id } = req.params;
            const cart = await Cart.findByIdAndDelete(id);
            if (!cart) return res.status(404).send("Cart not found");
            res.status(200).send({ message: "Cart deleted successfully" });
        } catch (error) {
            res.status(500).send(`Error deleting cart: ${error.message}`);
        }
    }
    async getCartByUser(req, res) {
        try {
            const { id } = req.params;
            const cart = await Cart.findOne({ usuario: id });
            if (!cart) return res.status(404).send("Cart not found");
            res.status(200).send({ cart });
        } catch (error) {
            res.status(500).send(`Error fetching cart items: ${error.message}`);
        }
    }
    async getAll(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            const carts = await Cart.find();
            res.status(200).send({ carts });
        } catch (error) {
            res.status(500).send(`Error fetching carts: ${error.message}`);
        }
    }
    async getById(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verifyRoleDecoded(verified.rol)) return res.status(403).send("Access denied");
            const { id } = req.params;
            const cart = await Cart.findById(id);
            if(verified.usuario !== cart.usuario) return res.status(403).send("Access denied");
            if (!cart) return res.status(404).send("Cart not found");
            res.status(200).send({ cart });
        } catch (error) {
            res.status(500).send(`Error fetching cart: ${error.message}`);
        }
    }
}

export default new CartController();