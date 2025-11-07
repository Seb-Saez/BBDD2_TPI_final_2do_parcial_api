import User from "../model/User.js";
import { comparePassword, hashPassword } from "../services/password.js";
import {
    extractToken,
    generateToken,
    verifyHeaderTokenAndVerify,
    verifyToken,
} from "../services/token.js";

class UserController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los métodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincrónicas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    async create(req, res) {
        try {
            const { nombre, email, password, telefono, rol, direcciones } = req.body;

            const hashedPassword = await hashPassword(password);

            const direccionesArray = Array.isArray(direcciones)
                ? direcciones
                : direcciones
                    ? [direcciones]
                    : [];

            const newUser = {
                nombre,
                email,
                password: hashedPassword,
                direcciones: direccionesArray,
                telefono,
                rol,
            };
            await User.create(newUser);

            res.status(201).json({
                mensaje: "Usuario creado exitosamente",
                usuario: { nombre, email, direcciones: direccionesArray },
            });
        } catch (error) {
            res.status(500).json({ error: `Error al crear el usuario: ${error.message}` });
        }
    }

    async getAll(req, res) {
        try {
            if (req.user.rol !== "ADMIN")
                return res.status(403).json({ mensaje: "No autorizado" });

            const users = await User.find().select("-password -__v");
            res.status(200).json({ usuarios: users });
        } catch (error) {
            res.status(500).json({ error: `${error.message}` });
        }
    }

    async getById(req, res) {
        try {
            if (req.user.id !== req.params.id && req.user.rol !== "ADMIN")
                return res.status(403).json({ mensaje: "Acceso denegado" });

            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

            const { nombre, email } = user;
            res.status(200).json({ nombre, email });
        } catch (error) {
            res.status(500).json({ error: `Error al obtener el usuario: ${error.message}` });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;

            if (req.user.id !== id && req.user.rol !== "ADMIN")
                return res.status(403).json({ mensaje: "Acceso denegado" });

            const { email: emailBody, nombre: nombreBody, password } = req.body;

            const allowedUpdates = {};

            if (nombreBody) allowedUpdates.nombre = nombreBody;
            if (emailBody) allowedUpdates.email = emailBody;
            if (password) {
                const hashedPassword = await hashPassword(password);
                allowedUpdates.password = hashedPassword;
            }

            const updatedUser = await User.findByIdAndUpdate(
                id,
                { $set: allowedUpdates },
                { new: true }
            );

            if (!updatedUser)
                return res.status(404).json({ mensaje: "Error al actualizar el usuario" });

            const {
                nombre: nombreActualizado,
                email: emailActualizado,
                telefono,
                rol,
                direcciones,
            } = updatedUser;

            res.status(200).json({
                mensaje: "Usuario actualizado con éxito",
                usuario: {
                    id: updatedUser._id,
                    nombre: nombreActualizado,
                    email: emailActualizado,
                    telefono: telefono || null,
                    rol: rol || null,
                    direcciones: direcciones || [],
                },
            });
        } catch (error) {
            res.status(500).json({ error: `Error al actualizar el usuario: ${error.message}` });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (req.user.id !== id && req.user.rol !== "ADMIN")
                return res.status(403).json({ mensaje: "Acceso denegado" });

            const deletedUser = await User.findByIdAndDelete(id);

            if (!deletedUser)
                return res.status(404).json({ mensaje: "Error al eliminar el usuario" });

            res.status(200).json({ mensaje: "Usuario eliminado con éxito" });
        } catch (error) {
            res.status(500).json({ error: `${error.message}` });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ mensaje: "Error en inicio de sesión" });

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch)
                return res.status(401).json({ mensaje: "Error en inicio de sesión" });

            const userData = {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
            };
            const token = generateToken(userData);

            res.setHeader("Authorization", `Bearer ${token}`);

            res.status(200).json({
                mensaje: "Inicio de sesión exitoso",
                token: token,
                usuario: {
                    id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol,
                },
            });
        } catch (error) {
            res.status(500).json({ error: `${error.message}` });
        }
    }

    async logout(req, res) {
        try {
            const { email } = req.body;

            if (req.user.email !== email)
                return res.status(403).json({ mensaje: "Acceso denegado" });

            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ mensaje: "Error al cerrar sesión" });

            res.setHeader("Authorization", "");
            res.status(200).json({ mensaje: "Sesión cerrada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: `${error.message}` });
        }
    }
}

export default new UserController();
