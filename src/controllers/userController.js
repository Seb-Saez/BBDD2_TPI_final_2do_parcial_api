import User from "../model/User.js";
import { hashPassword } from "../services/password.js";
class UserController{
    async create(req, res){
        try{
            const{ nombre, email, password, telefono, rol, direcciones } = req.body;

            const hashedPassword = await hashPassword(password);

            // Asegurar que direcciones sea un array (acepta objeto o array)
            const direccionesArray = Array.isArray(direcciones) ? direcciones : (direcciones ? [direcciones] : []);

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
        }catch(error){
            res.status(500).send(`Error creating user: ${error.message}`);
        }
    }

    async getAll(req, res){
        try{
            const users = await User.find();
            res.status(200).send({users});
        }catch(error){
            res.status(500).send(`Error fetching users: ${error.message}`);
        }
    }

    async getById(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user) return res.status(404).send("User not found");
            const {nombre, email} = user;
            res.status(200).send({nombre, email});
        }catch(error){
            res.status(500).send(`Error fetching user: ${error.message}`);
        }
    }
    async update(req, res){
        try{
            const { id } = req.params;
            const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
            if(!updatedUser) return res.status(404).send("User not found");
            res.status(200).send(updatedUser);
        }catch(error){
            res.status(500).send(`Error updating user: ${error.message}`);
        }
    }

    async delete(req, res){
        try{
            const { id } = req.params;
            const deletedUser = await User.findByIdAndDelete(id);
            if(!deletedUser) return res.status(404).send("User not found");
            res.status(200).send("User deleted successfully");
        }catch(error){
            res.status(500).send(`Error deleting user: ${error.message}`);
        }
    }
}


export default new UserController();