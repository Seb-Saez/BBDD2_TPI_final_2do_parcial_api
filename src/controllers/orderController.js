import Cart from '../model/Cart.js';
import Order from '../model/Order.js';
import mongoose from 'mongoose';
import { verifyRoleDecoded } from '../services/token.js';
import { verifyHeaderTokenAndVerify } from '../services/token.js';

class OrderController {

    //  Crear pedido
    // async create(req, res) {
    //     try {
    //         const header = req.headers['authorization'];
    //         if (!header) return res.status(401).json({ error: "No autorizado" });

    //         // Extraer token
    //         const verified = verifyHeaderTokenAndVerify(header);
    //         const { userId, metodoPago } = req.body;

    //         if (verified.id !== userId) return res.status(403).json({ error: "Acceso denegado" });
    //         if (!userId || !metodoPago) return res.status(400).json({ error: "Faltan campos obligatorios" });

    //         const cart = await Cart.findOne({ usuario: userId });
    //         if (!cart || cart.productos.length === 0) {
    //             return res.status(400).json({ error: "El carrito está vacío o no existe" });
    //         }


    //         const newOrder = await Order.create({
    //             usuario: userId,
    //             productos: cart.productos,
    //             metodoPago: metodoPago
    //         });

    //         res.status(201).json({
    //             mensaje: "Pedido creado correctamente",
    //             pedido: newOrder
    //         });
    //     } catch (error) {
    //         res.status(500).json({ error: `Error al crear el pedido: ${error.message}` });
    //     }
    // }


    // cambios seba probando
    // nuevo create de carrito
    async create(req, res) {
    try {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ error: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

        const { userId, metodoPago } = req.body;

        const cart = await Cart.findOne({ usuario: userId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
        if (!cart.productos || cart.productos.length === 0)
            return res.status(400).json({ error: "El carrito está vacío" });

        // ✅ Convertimos correctamente los productos del carrito
        const productosConvertidos = cart.productos.map(p => ({
            producto: p.product?._id || p.product, // ← toma el id real
            nombre: p.product?.nombre || p.nombre,
            cantidad: p.cantidad,
            subtotal: p.product?.precio ? p.product.precio * p.cantidad : p.subtotal
        }));

        const order = new Order({
            usuario: userId,
            productos: productosConvertidos,
            total: cart.total,
            metodoPago: metodoPago,
            fecha: new Date()
        });

        await order.save();
        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json({ mensaje: "Pedido creado correctamente", pedido: order });
    } catch (error) {
        res.status(500).json({ error: `Error al crear el pedido: ${error.message}` });
    }
}





    //  Obtener todos los pedidos (solo admin)
    async getAll(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified || verified.rol !== 'ADMIN') return res.status(403).json({ error: "Acceso denegado" });

            const orders = await Order.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'usuario',
                        foreignField: '_id',
                        as: 'usuarioInfo'
                    }
                },
                { $unwind: '$usuarioInfo' },
                {
                    $project: {
                        _id: 1,
                        "usuarioInfo.nombre": 1,
                        "usuarioInfo.email": 1,
                        productos: 1,
                        total: 1,
                        metodoPago: 1,
                        createdAt: 1
                    }
                }
            ]);

            res.status(200).json({ pedidos: orders });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener los pedidos: ${error.message}` });
        }
    }

    //  Obtener pedido por ID
    async getById(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified) return res.status(403).json({ error: "Acceso denegado" });

            const { id } = req.params;
            if (!id) return res.status(400).json({ error: "El ID del pedido es obligatorio" });

            const order = await Order.findOne({ _id: id });

            if (!verifyRoleDecoded(verified.rol))
                return res.status(403).json({ error: "Acceso denegado" });

            if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

            res.status(200).json({ pedido: order });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener el pedido: ${error.message}` });
        }
    }

    //  Actualizar estado del pedido
    async update(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            const verified = verifyHeaderTokenAndVerify(header);
            if (verified.rol !== 'ADMIN') return res.status(403).json({ error: "Acceso denegado" });

            const { id } = req.params;
            const { estado } = req.body;

            const validStates = ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
            if (!validStates.includes(estado)) {
                return res.status(400).json({ error: "Estado del pedido inválido" });
            }

            const order = await Order.findByIdAndUpdate(id, { estado: estado }, { new: true });
            if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

            res.status(200).json({
                mensaje: "Estado del pedido actualizado correctamente",
                pedido: order
            });
        } catch (error) {
            res.status(500).json({ error: `Error al actualizar el pedido: ${error.message}` });
        }
    }

    //  Eliminar pedido
    async delete(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            const verified = verifyHeaderTokenAndVerify(header);
            if (verified.rol !== 'ADMIN') return res.status(403).json({ error: "Acceso denegado" });

            const { id } = req.params;
            const order = await Order.findByIdAndDelete(id);

            if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

            res.status(200).json({ mensaje: "Pedido eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: `Error al eliminar el pedido: ${error.message}` });
        }
    }

    //  Obtener pedidos por estado
    async getOrdersByState(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified || verified.rol !== 'ADMIN') return res.status(403).json({ error: "Acceso denegado" });

            const stats = await Order.aggregate([
                {
                    $group: {
                        _id: '$estado',
                        total: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.status(200).json({ estadisticas: stats });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener las estadísticas de pedidos: ${error.message}` });
        }
    }

    // obener carrito por userId

    async getOrdersByUserId(req, res) {
        try {
            const { userId } = req.params;

            // Buscar todas las órdenes del usuario
            const orders = await Order.find({ usuario: userId })
            //traer los datos del producto
                .populate("productos.producto", "nombre precio") 
                // traer los datos del usuario
                .populate("usuario", "nombre email"); 

            if (!orders || orders.length === 0) {
                return res.status(404).json({ mensaje: "No se encontraron pedidos para este usuario" });
            }

            res.status(200).json({ pedidos: orders });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener pedidos del usuario: ${error.message}` });
        }
    }


}

export default new OrderController();
