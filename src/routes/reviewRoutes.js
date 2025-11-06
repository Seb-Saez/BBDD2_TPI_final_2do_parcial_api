import express from "express";
import reviewController from "../controllers/reviewController.js"

const router = express.Router();

router.post("/", reviewController.create);
router.get("/:id", reviewController.getById);
router.put("/:id", reviewController.update);
router.delete("/:id", reviewController.delete);
router.get("/", reviewController.getAll);

export default router;