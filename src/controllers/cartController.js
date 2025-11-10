import Cart from '../model/Cart.js';
import User from '../model/User.js';

class CartController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los métodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincrónicas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    /**
     * Crear un nuevo carrito para un usuario.
     * Verifica que el usuario exista y no tenga un carrito previo.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async create(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ error: "Faltan campos obligatorios" });

            const userExist = await User.findById(userId);
            if (!userExist) return res.status(404).json({ error: "Usuario no encontrado" });

            const cartExist = await Cart.findOne({ usuario: userId });
            if (cartExist) return res.status(400).json({ error: "El usuario ya tiene un carrito creado" });

            const newCart = await Cart.create({
                usuario: userId,
                productos: []
            });

            res.status(201).json({
                mensaje: "Carrito creado correctamente",
                carrito: newCart
            });
        } catch (error) {
            res.status(500).json({ error: `Error al crear el carrito: ${error.message}` });
        }
    }

    /**
     * Actualizar el carrito agregando o modificando productos.
     * Si el producto ya existe, suma la cantidad; si no, lo agrega.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async update(req, res) {
        try {
            const { id } = req.params; // id del carrito
            const { productoId, cantidad } = req.body; // usamos productoId ahora

            if (!productoId || !cantidad) {
                return res.status(400).json({ error: "Faltan campos obligatorios (productoId, cantidad)" });
            }

            const cart = await Cart.findById(id);
            if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

            // Verificar si el producto ya existe en el carrito
            const productoExistente = cart.productos.find(
                (p) => p.product.toString() === productoId
            );

            if (productoExistente) {
                // Si existe, solo actualiza la cantidad
                productoExistente.cantidad += cantidad;
            } else {
                // Si no existe, se agrega como nuevo con la referencia del producto
                cart.productos.push({ product: productoId, cantidad });
            }

            const updatedCart = await Cart.findByIdAndUpdate(
                id,
                {
                    productos: cart.productos,
                    cantidad: cart.cantidad
                },
                { new: true }
            ).populate({
                path: 'productos.product',
                select: 'nombre precio descripcion'
            }).select('-__v -createdAt -updatedAt');

            res.status(200).json({
                mensaje: "Producto agregado correctamente al carrito",
                carrito: updatedCart
            });
        } catch (error) {
            res.status(500).json({ error: `Error al agregar productos al carrito: ${error.message}` });
        }
    }

    /**
     * Eliminar un carrito por su ID.
     * Verifica que el usuario autenticado sea el dueño del carrito.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const cart = await Cart.findById(id);
            if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

            // Verificar que el usuario autenticado sea el dueño del carrito
            if (cart.usuario.toString() !== req.user.id) {
                return res.status(403).json({ error: "Acceso denegado" });
            }

            await Cart.findByIdAndDelete(id);
            res.status(200).json({ mensaje: "Carrito eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: `Error al eliminar el carrito: ${error.message}` });
        }
    }

    /**
     * Obtener el carrito de un usuario específico.
     * Retorna información simplificada con nombre y cantidad de productos.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getCartByUser(req, res) {
        try {
            const { id } = req.params;
            const cart = await Cart.findOne({ usuario: id })
                //populate para traer nombre de productos
                .populate('productos.product', 'nombre');

            if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

            //devolver nombre y cantidad
            const productosSimplificados = cart.productos.map(p => ({
                nombre: p.product.nombre,
                cantidad: p.cantidad
            }));

            res.status(200).json({
                carrito: {
                    _id: cart._id,
                    usuario: cart.usuario,
                    productos: productosSimplificados
                }
            });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener el carrito del usuario: ${error.message}` });
        }
    }

    /**
     * Obtener todos los carritos (solo admin).
     * Retorna información simplificada de todos los carritos en el sistema.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getAll(req, res) {
        try {
            const carts = await Cart.find()
                .populate('productos.product', 'nombre');

            // mostar los datos del carrito
            const carritosSimplificados = carts.map(cart => ({
                _id: cart._id,
                usuario: cart.usuario,
                productos: cart.productos.map(p => ({
                    nombre: p.product.nombre,
                    cantidad: p.cantidad
                }))
            }));

            res.status(200).json({ carritos: carritosSimplificados });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener los carritos: ${error.message}` });
        }
    }

    /**
     * Obtener un carrito específico por su ID.
     * Verifica que el usuario autenticado sea el dueño del carrito.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const cart = await Cart.findById(id)
                .populate('productos.product', 'nombre');

            if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

            // Verificar que el usuario autenticado sea el dueño del carrito
            if (cart.usuario.toString() !== req.user.id) {
                return res.status(403).json({ error: "Acceso denegado" });
            }

            const productosSimplificados = cart.productos.map(p => ({
                nombre: p.product.nombre,
                cantidad: p.cantidad
            }));

            res.status(200).json({
                carrito: {
                    _id: cart._id,
                    usuario: cart.usuario,
                    productos: productosSimplificados
                }
            });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener el carrito: ${error.message}` });
        }
    }

    /**
     * Calcular el total del carrito de un usuario.
     * Retorna subtotales por producto y el total general del carrito.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    async getCartTotal(req, res) {
        try {
            const { usuarioId } = req.params;

            // buscar carrito por user id y lo poblamos con los productos
            const cart = await Cart.findOne({ usuario: usuarioId })
                .populate('productos.product', 'nombre precio');

            if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

            // Calcular subtotales y total
            const productosCalculados = cart.productos.map(p => {
                const subtotal = p.product.precio * p.cantidad;
                return {
                    nombre: p.product.nombre,
                    cantidad: p.cantidad,
                    precioUnitario: p.product.precio,
                    subtotal
                };
            });

            // calculamos el total con un acumulador
            const total = productosCalculados.reduce((acc, item) => acc + item.subtotal, 0);

            res.status(200).json({
                carrito: {
                    id: cart._id,
                    usuario: cart.usuario,
                    productos: productosCalculados,
                    total
                }
            });
        } catch (error) {
            res.status(500).json({ error: `Error al calcular el total del carrito: ${error.message}` });
        }
    }



}

export default new CartController();
