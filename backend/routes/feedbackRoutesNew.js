const express = require("express");
const router = express.Router();
const feedbackControllerNew = require("../controllers/feedbackControllerNew");

router.get("/validate/:token", feedbackControllerNew.validateToken);
router.post(
  "/submit-with-token",
  feedbackControllerNew.submitFeedbackWithToken,
);
router.get("/statistics", feedbackControllerNew.getStatistics);
router.get("/all", feedbackControllerNew.getAllFeedbacks);

module.exports = router;
