import Cart from '../model/Cart.js';
import User from '../model/User.js';
import { verifyRoleDecoded } from '../services/token.js';
import { verifyHeaderTokenAndVerify } from '../services/token.js';

class CartController {
    async create(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

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


// endpoint funcionando bien, vamos a probar otro
    // añadir un producto al carrito, modificarlo
//     async update(req, res) {
//     try {
//         const header = req.headers['authorization'];
//         if (!header) return res.status(401).json({ error: "No autorizado" });

//         const verified = verifyHeaderTokenAndVerify(header);
//         if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

//         const { id } = req.params;
//         const { producto, cantidad } = req.body;

//         const cart = await Cart.findById(id);
//         if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

//         // agrega el producto al carrito
//         await Cart.findByIdAndUpdate(id, { 
//             $push: { productos: { product: producto, cantidad: cantidad } } 
//         });

//         // aca le metemos el populate para traer el nombre de los productos, precio y descripcino, asi se ve mas visal
//         const updatedCart = await Cart.findById(id)
//         .populate({
//             path: 'productos.product',
//             // aca me traigo el nombre, precio y la descripcion
//                 select: 'nombre precio descripcion'
//             })
//             .select('-__v -createdAt -updatedAt');

//         res.status(200).json({
//             mensaje: "Producto agregado correctamente al carrito",
//             carrito: updatedCart
//         });
//     } catch (error) {
//         res.status(500).json({ error: `Error al agregar productos al carrito: ${error.message}` });
//     }
// }


//  SEBA PROBANDO
// nuevo endpoint de carrito update para guardar id y que fucnione order
// añadir un producto al carrito, modificarlo
async update(req, res) {
    try {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ error: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

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

        await cart.save();

        // Populate para mostrar información del producto en la respuesta
        const updatedCart = await Cart.findById(id)
            .populate({
                path: 'productos.product',
                select: 'nombre precio descripcion'
            })
            .select('-__v -createdAt -updatedAt');

        res.status(200).json({
            mensaje: "Producto agregado correctamente al carrito",
            carrito: updatedCart
        });
    } catch (error) {
        res.status(500).json({ error: `Error al agregar productos al carrito: ${error.message}` });
    }
}




    async delete(req, res) {
        try {
            const header = req.headers['authorization'];
            if (!header) return res.status(401).json({ error: "No autorizado" });

            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

            const { id } = req.params;
            const cart = await Cart.findByIdAndDelete(id);
            if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

            res.status(200).json({ mensaje: "Carrito eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: `Error al eliminar el carrito: ${error.message}` });
        }
    }

    // async getCartByUser(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const cart = await Cart.findOne({ usuario: id });
    //         if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    //         res.status(200).json({ carrito: cart });
    //     } catch (error) {
    //         res.status(500).json({ error: `Error al obtener el carrito del usuario: ${error.message}` });
    //     }
    // }

    // async getAll(req, res) {
    //     try {
    //         const header = req.headers['authorization'];
    //         if (!header) return res.status(401).json({ error: "No autorizado" });

    //         //Extraer token
    //         const verified = verifyHeaderTokenAndVerify(header);
    //         if (verified.rol !== 'ADMIN') return res.status(403).json({ error: "Acceso denegado" });

    //         const carts = await Cart.find();

    //         res.status(200).json({ carritos: carts });
    //     } catch (error) {
    //         res.status(500).json({ error: `Error al obtener los carritos: ${error.message}` });
    //     }
    // }

    // async getById(req, res) {
    //     try {
    //         const header = req.headers['authorization'];
    //         if (!header) return res.status(401).json({ error: "No autorizado" });

    //         //Extraer token
    //         const verified = verifyHeaderTokenAndVerify(header);
    //         if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

    //         const { id } = req.params;
    //         const cart = await Cart.findById(id);
    //         if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    //         if (cart.usuario.toString() !== verified.id) {
    //             return res.status(403).json({ error: "Acceso denegado" });
    //         }
    //         res.status(200).json({ carrito: cart });
    //     } catch (error) {
    //         res.status(500).json({ error: `Error al obtener el carrito: ${error.message}` });
    //     }
    // }

// traer carrito por usuario
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

// traer todos los carritos

async getAll(req, res) {
    try {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ error: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (verified.rol !== 'ADMIN') return res.status(403).json({ error: "Acceso denegado" });

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

// traer carrito por id de carrito

async getById(req, res) {
    try {
        const header = req.headers['authorization'];
        if (!header) return res.status(401).json({ error: "No autorizado" });

        const verified = verifyHeaderTokenAndVerify(header);
        if (!verifyRoleDecoded(verified.rol)) return res.status(403).json({ error: "Acceso denegado" });

        const { id } = req.params;
        const cart = await Cart.findById(id)
            .populate('productos.product', 'nombre');

        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
        if (cart.usuario.toString() !== verified.id) {
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


// traer todar del carrito

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
