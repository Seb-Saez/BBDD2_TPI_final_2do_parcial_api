import express from "express"
import userController from "../controllers/userController.js"

const router = express.Router()

router.post("/", userController.create)
router.post("/login", userController.login)
router.post("/logout", userController.logout)
router.get("/", userController.getAll)
router.get("/:id", userController.getById)
router.put("/:id", userController.update)
router.delete("/:id", userController.delete)

export default router