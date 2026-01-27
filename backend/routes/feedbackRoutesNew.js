const express = require("express");
const router = express.Router();
const feedbackControllerNew = require("../controllers/feedbackControllerNew");

// Task.md compliant routes
router.get("/validate/:token", feedbackControllerNew.validateToken);
router.post("/submit", feedbackControllerNew.submitFeedbackWithToken);

// Admin routes
const adminRouter = express.Router();
adminRouter.get("/feedback", feedbackControllerNew.getAllFeedbacks);
adminRouter.get("/statistics", feedbackControllerNew.getStatistics);

module.exports = { router, adminRouter };
