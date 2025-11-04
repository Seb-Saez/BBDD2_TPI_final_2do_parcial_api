import express from "express"

import userController from "../controllers/userController.js"

const router = express.Router()

router.get("/", userController.getAll)
router.get("/:id", userController.getById)
router.post("/", userController.create)
router.put("/:id", userController.update)
router.delete("/:id", userController.delete)
router.post("/login", userController.login)
router.post("/logout", userController.logout)

export default router