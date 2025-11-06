import express from "express"
import userController from "../controllers/userController.js"
import { authenticate, checkAlredyLoggedIn } from "../middleware/auth.js"

const router = express.Router()

router.post("/", userController.create)
router.post("/login",checkAlredyLoggedIn,userController.login)
router.post("/logout",authenticate,userController.logout)
router.get("/",authenticate,userController.getAll)
router.get("/:id",authenticate, userController.getById)
router.put("/:id",authenticate, userController.update)
router.delete("/:id",authenticate, userController.delete)

export default router