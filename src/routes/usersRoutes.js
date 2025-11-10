import express from "express"
import userController from "../controllers/userController.js"
import { adminAuthenticate, authenticate, checkAlredyLoggedIn } from "../middleware/auth.js"

const router = express.Router()

//Rutas de usuarios
//Crear usuario
//Rutas protegidas que requieren autenticación mediante el middleware 'authenticate'
router.post("/", userController.create)
//Login y Logout
/**
 * La ruta de login utiliza el middleware 'checkAlredyLoggedIn' para evitar inicios de sesión redundantes.
 */
router.post("/login",checkAlredyLoggedIn,userController.login)
/**
 * La ruta de logout utiliza el middleware 'authenticate' para asegurar que solo usuarios autenticados puedan cerrar sesión.
 */
router.post("/logout",authenticate,userController.logout)
/**
 * Las rutas para obtener todos los usuarios, obtener un usuario por ID, actualizar y eliminar usuarios están protegidas por el middleware 'authenticate'.
 */
router.get("/",authenticate,adminAuthenticate,userController.getAll)
router.get("/:id",authenticate, userController.getById)
router.put("/:id",authenticate, userController.update)
router.delete("/:id",authenticate, userController.delete)

export default router