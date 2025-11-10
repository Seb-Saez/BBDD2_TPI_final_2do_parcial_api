import Cart from '../model/Cart.js';
import Order from '../model/Order.js';

class OrderController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los métodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincrónicas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    /**
     * Crear un nuevo pedido a partir del carrito del usuario.
     * Convierte los productos del carrito en una orden y elimina el carrito.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async create(req, res) {
    try {
        const { userId, metodoPago } = req.body;

        const cart = await Cart.findOne({ usuario: userId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
        if (!cart.productos || cart.productos.length === 0)
            return res.status(400).json({ error: "El carrito está vacío" });

        // ✅ Convertimos correctamente los productos del carrito
        const productosConvertidos = cart.productos.map(p => ({
            producto: p.product._id, // ← toma el id real
            cantidad: p.cantidad,
        }));

        const order = new Order({
            usuario: userId,
            productos: productosConvertidos,
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
    
    /**
     * Obtener todos los pedidos con información del usuario (solo admin).
     * Usa agregación para incluir datos del usuario en la respuesta.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getAll(req, res) {
        try {
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

    /**
     * Obtener un pedido específico por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ error: "El ID del pedido es obligatorio" });

            const order = await Order.findOne({ _id: id });

            if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

            res.status(200).json({ pedido: order });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener el pedido: ${error.message}` });
        }
    }

    /**
     * Actualizar el estado de un pedido.
     * Estados válidos: PENDIENTE, ENVIADO, ENTREGADO, CANCELADO.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async update(req, res) {
        try {
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

    /**
     * Eliminar un pedido por su ID.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findByIdAndDelete(id);

            if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

            res.status(200).json({ mensaje: "Pedido eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: `Error al eliminar el pedido: ${error.message}` });
        }
    }

    /**
     * Obtener estadísticas de pedidos agrupados por estado.
     * Retorna el conteo de pedidos por cada estado.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getOrdersByState(req, res) {
        try {
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

    /**
     * Obtener todos los pedidos de un usuario específico.
     * Incluye información de productos y usuario mediante populate.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
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
