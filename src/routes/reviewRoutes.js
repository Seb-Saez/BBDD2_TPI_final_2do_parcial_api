import express from "express";
import reviewController from "../controllers/reviewController.js";
import { authenticate, adminAuthenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, reviewController.create);
router.get("/:id", reviewController.getById);
router.put("/:id", authenticate, reviewController.update);
router.delete("/:id", authenticate, reviewController.delete);
router.get("/", adminAuthenticate, reviewController.getAll);

export default router;