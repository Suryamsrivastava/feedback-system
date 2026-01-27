const feedbackService = require("../services/feedbackService");

class FeedbackControllerNew {
  async validateToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      const validation = await feedbackService.validateFeedbackToken(token);

      return res.status(200).json({
        success: true,
        ...validation,
      });
    } catch (error) {
      console.error("Token validation error:", error);

      if (
        error.message.includes("Invalid") ||
        error.message.includes("expired")
      ) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: error.message,
        });
      }

      if (error.message.includes("already submitted")) {
        return res.status(410).json({
          success: false,
          valid: false,
          message: "This feedback has already been submitted",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to validate token",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  async submitFeedbackWithToken(req, res) {
    try {
      const { token, ...feedbackData } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      if (
        !feedbackData.name ||
        !feedbackData.experience ||
        feedbackData.recommendation === undefined ||
        !feedbackData.tip_asked
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Required fields: name, experience, recommendation, tip_asked",
        });
      }

      const result = await feedbackService.submitFeedbackWithToken(
        token,
        feedbackData,
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Feedback submission error:", error);

      if (
        error.message.includes("Invalid") ||
        error.message.includes("already used")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to submit feedback",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await feedbackService.getStatistics();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  async getAllFeedbacks(req, res) {
    try {
      const feedbacks = await feedbackService.getAllFeedbacks();

      return res.status(200).json({
        success: true,
        count: feedbacks.length,
        data: feedbacks,
      });
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch feedbacks",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = new FeedbackControllerNew();
