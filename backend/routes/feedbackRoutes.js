const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { validateFeedback } = require("../middleware/validation");

router.post("/submit", validateFeedback, feedbackController.submitFeedback);
router.get("/all", feedbackController.getAllFeedbacks);
router.get("/order/:order_id", feedbackController.getFeedbackByOrderId);
router.get("/user/:order_id", feedbackController.getUserByOrderId);
router.get("/statistics", feedbackController.getStatistics);
router.get("/form-statistics", feedbackController.getFormStatistics);

module.exports = router;
