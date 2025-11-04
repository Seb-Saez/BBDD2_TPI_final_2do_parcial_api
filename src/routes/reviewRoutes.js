import reviewController from "../controllers/reviewController.js";
import express from "express";

const router = express.Router();

router.post("/reviews", reviewController.create);
// router.get("/reviews/:id", reviewController.getAll);
// router.put("/reviews/:id", reviewController.update);
// router.delete("/reviews/:id", reviewController.delete);
// router.get("/reviews", reviewController.getAll);

export default router;