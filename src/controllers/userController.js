import User from "../model/User.js";
import { comparePassword, hashPassword } from "../services/password.js";
import { extractToken, generateToken, verifyHeaderTokenAndVerify, verifyToken } from "../services/token.js";
class UserController {
    /**
     * En todas las funciones se maneja el try catch para capturar errores.
     * Se usan los metodos de mongoose para interactuar con la base de datos.
     * Las funciones son asincronas y usan await para esperar las promesas.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */

    async create(req, res) {
        try {
            //Desestructuracion del body
            const { nombre, email, password, telefono, rol, direcciones } = req.body;
            //Hashear la contraseña
            const hashedPassword = await hashPassword(password);

            // Asegurar que direcciones sea un array (acepta objeto o array)
            const direccionesArray = Array.isArray(direcciones) ? direcciones : (direcciones ? [direcciones] : []);
            //Crear el nuevo usuario
            const newUser = {
                nombre,
                email,
                password: hashedPassword,
                direcciones: direccionesArray,
                telefono,
                rol
            };
            await User.create(newUser);
            res.status(201).send({ message: "User created successfully", usuario: { nombre, email, direcciones: direccionesArray } });
        } catch (error) {
            res.status(500).send(`Error creating user: ${error.message}`);
        }
    }

    async getAll(req, res) {
        try {
            //Obtener token
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Error in fetching users");
            //Extraer token
            const verified = verifyHeaderTokenAndVerify(header);
            if (!verified) return res.status(401).send("Error in fetching users");
            //Verificar Administrador
            if (verified.rol !== 'ADMIN') return res.status(403).send("Access denied");

            //Traer los usuarios excluyendo contraseñas
            const users = await User.find().select('-password -__v');
            res.status(200).send({ users });
        } catch (error) {
            res.status(500).send(`${error.message}`);
        }
    }

    async getById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).send("User not found");
            const { nombre, email } = user;
            res.status(200).send({ nombre, email });
        } catch (error) {
            res.status(500).send(`Error fetching user: ${error.message}`);
        }
    }
    async update(req, res) {
        try {
            //Obtener token
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Error updating user");
            //Extraer token
            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).send("Error updating user");
            //Verificar token
            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).send("Error updating user");
            //Desestructurar id de params
            const { id } = req.params;
            //Verificar que el id del token coincida con el id a modificar o sea ADMIN
            if (verified.id !== id && verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            //Desestructurar para Sacar solo el nombre, email o contraseña del body para actualizar
            const {email, nombre, password} = req.body;
            //Se crea un objeto porque a mongoose se le pasa un objeto con los campos a actualizar
            const allowedUpdates = {};
            //Validaciones si no estan vacios se agregan al objeto con una key value
            /**
             * {
             *  nombre: 'Nuevo Nombre',
             *  email:  example@example.com,
             *  password: 'hashedPassword'
             * }
             */
            if (nombre) allowedUpdates.nombre = nombre;
            if (email) allowedUpdates.email = email;
            if (password) {
                const hashedPassword = await hashPassword(password);
                allowedUpdates.password = hashedPassword;
            }
            //Buscar usuario por id y actualizar
            //New:true para devolver el documento actualizado
            //Se le pasa el objeto con los campos a actualizar parametrizados
            const updatedUser = await User.findByIdAndUpdate(id, {
                $set: allowedUpdates
            }, { new: true });
            //Si no se encuentra el usuario, 404
            if (!updatedUser) return res.status(404).send("Error in updating user");
            //Si se encuentra desestructurar nombre y email para devolver
            const { nombreUpdated, emailUpdated } = updatedUser;
            //Devolver exito con datos actualizados
            res.status(200).send({ nombreUpdated, emailUpdated });
        } catch (error) {
            res.status(500).send(`Error updating user: ${error.message}`);
        }
    }

    async delete(req, res) {
        try {
            //Obtener token
            const header = req.headers['authorization'];
            if (!header) return res.status(401).send("Error in deleting user");
            //Extraer token
            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).send("Error in deleting user");
            //Verificar token
            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).send("Error in deleting user");
            //Desestructurar id de params
            const { id } = req.params;
            //Verificar que coincida el id del token con el id a eliminar o sea ADMIN
            if (verified.id !== id && verified.rol !== 'ADMIN') return res.status(403).send("Access denied");
            //Buscar usuario por id y eliminar
            const deletedUser = await User.findByIdAndDelete(id);
            //Si no se encuentra el usuario, 404
            if (!deletedUser) return res.status(404).send("Error in deleting user");
            //Si se elimina, devolver exito
            res.status(200).send("User deleted successfully");
        } catch (error) {
            res.status(500).send(`${error.message}`);
        }
    }
    async login(req, res) {
        try {
            //Desestructuracion del body
            const { email, password } = req.body;
            //Buscar usuario por email
            //findOne({[campo]: valor-> filtro})
            const user = await User.findOne({ email });
            //Si hay usuario, comparar contraseñas
            const isMatch = await comparePassword(password, user.password);
            //Si no hay coincidencia 401 no autorizado
            if (!user) return res.status(401).send("Error in login");
            if(!isMatch) return res.status(401).send("Error in login");
            //Generar token JWT
            const userData = {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
            const token = generateToken(userData);
            //Incluir token en la respuesta
            res.setHeader('Authorization', `Bearer ${token}`);
            //Si hay coincidencia, devolver exito
            res.status(200).send({ message: "Login successful"});
        } catch (error) {
            res.status(500).send(`${error.message}`);
        }
    }
    async logout(req, res) {
        try {
            //Saca el email del body
            const { email } = req.body;
            //Obtener token
            const header = req.headers['authorization'];
            //Si no existe el header de autorizacion
            if (!header) return res.status(401).send("Error in logout");
            //Extraer token
            const extractedToken = extractToken(header);
            if (!extractedToken) return res.status(401).send("Error in logout");
            //Verificar token
            const verified = verifyToken(extractedToken);
            if (!verified) return res.status(401).send("Error in logout");
            //Buscar usuario por email
            const user = await User.findOne({ email });
            if (!user) return res.status(404).send("Error in logout");
            //Eliminar token del cliente
            res.setHeader('Authorization', '');
            res.status(200).send("Logout successful");
        } catch (error) {
            res.status(500).send(`${error.message}`);
        }
    }
}

/**
 * Exporta una instancia de UserController para manejar las operaciones relacionadas con usuarios.
 * @module UserController
 */

export default new UserController();