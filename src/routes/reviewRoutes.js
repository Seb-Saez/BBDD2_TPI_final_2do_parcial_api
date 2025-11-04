import reviewController from "../controllers/reviewController";
import express from "express";

const router = express.Router();

router.post("/reviews", reviewController.createReview);
router.get("/reviews/:id", reviewController.getReviewById);
router.put("/reviews/:id", reviewController.updateReview);
router.delete("/reviews/:id", reviewController.deleteReview);
router.get("/reviews", reviewController.getAllReviews);

export default router;