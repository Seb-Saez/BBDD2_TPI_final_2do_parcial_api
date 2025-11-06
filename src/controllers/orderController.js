import Cart from '../model/Cart.js';
import Order from '../model/Order.js';
import mongoose from 'mongoose';
import { verifyRoleDecoded } from '../services/token.js';

class OrderController{
    async create(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            const { userId, metodoPago } = req.body;
            if (verified.id !== userId) return res.status(403).send("Access denied");
            if (!userId || !metodoPago) return res.status(400).send("Missing required fields");
            const cart = await Cart.findOne({ usuario: userId });
            if (!cart || cart.productos.length === 0) {
                return res.status(400).send("Cart is empty or does not exist");
            }
            
            const newOrder = await Order.create({
                usuario: userId,
                productos: cart.productos,
                metodoPago: metodoPago
            });
            res.status(201).send({ order: newOrder });
        }catch (error) {
            res.status(500).send(`Error creating order: ${error.message}`);
        }
    }
    async getAll(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified) return res.status(403).send("Access denied");
            if(verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            const orders = await Order.aggregate([
                {
                    $lookup:{
                        from: 'users',
                        localField: 'usuario',
                        foreignField: '_id',
                        as: 'usuarioInfo'
                    }
                },{
                    $unwind: '$usuarioInfo'
                },{
                    $project:{
                        '_id': 1,
                        'usuarioInfo':{
                            '_id':0,
                            'nombre': 1,
                            'email': 1
                        },
                        'productos':{
                            'producto': 0
                        },
                        'total': 1,
                        'metodoPago': 1,
                        'createdAt': 1
                    }
                }
            ]);
            res.status(200).send({ orders });
        } catch (error) {
            res.status(500).send(`Error fetching orders: ${error.message}`);
        }
    }
    async getById(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified) return res.status(403).send("Access denied");

            const { orderId } = req.params;
            if (!orderId) return res.status(400).send("Order ID is required");
            const order = await Order.findOne({_id: orderId});

            if(!verifyRoleDecoded(verified.rol) ){
                return res.status(403).send("Access denied");
            }
            if (!order) return res.status(404).send("Order not found");
            res.status(200).send({ order });
        } catch (error) {
            res.status(500).send(`Error fetching order: ${error.message}`);
        }
    }

    async update(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            const { orderId } = req.params;
            const { estado } = req.body;
            const validStates = ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
            if (!validStates.includes(estado)) {
                return res.status(400).send("Invalid order state");
            }
            const order = await Order.findByIdAndUpdate(orderId, { estado: estado }, { new: true });
            if (!order) return res.status(404).send("Order not found");
            res.status(200).send({ order });
        } catch (error) {
            res.status(500).send(`Error updating order: ${error.message}`);
        }
    }
    async delete(req, res) {
        try{
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            const { orderId } = req.params;
            const order = await Order.findByIdAndDelete(orderId);
            if (!order) return res.status(404).send("Order not found");
            res.status(200).send({ message: "Order deleted successfully" });
        }catch (error) {
            res.status(500).send(`Error deleting order: ${error.message}`);
        }
    }
    async getOrdersByState(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Unauthorized");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified) return res.status(403).send("Access denied");
            if(verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            const stats = await Order.aggregate([
                {
                    $group: {
                        _id: '$estado',
                        total: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            res.status(200).send({ stats });
        } catch (error) {
            res.status(500).send(`Error fetching orders by state: ${error.message}`);
        }
    }
}

export default new OrderController();