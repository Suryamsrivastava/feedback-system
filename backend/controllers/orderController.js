const feedbackService = require("../services/feedbackService");

class OrderController {
  async completeOrder(req, res) {
    try {
      const { order_id, form_type } = req.body;

      if (!order_id || typeof order_id !== "string") {
        return res.status(400).json({
          success: false,
          message: "order_id is required and must be a string",
        });
      }

      const validFormTypes = [
        "ticket_closure",
        "customer_satisfaction",
        "cutomer_feedback",
        "churn_feedback",
        "relocation_feedback",
      ];

      const finalFormType =
        form_type && validFormTypes.includes(form_type)
          ? form_type
          : "customer_satisfaction";

      const result = await feedbackService.triggerFeedbackRequest(
        order_id,
        finalFormType,
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error completing order:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("already submitted")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("not yet completed")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to trigger feedback request",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = new OrderController();
