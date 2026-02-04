const { pool } = require("../config/database");
const tokenService = require("./tokenService");
const emailService = require("./emailService");
const googleSheetsService = require("./googleSheetsService");

class FeedbackService {
  async triggerFeedbackRequest(order_id, form_type = "customer_satisfaction") {
    const connection = await pool.getConnection();

    try {
      const [orders] = await connection.query(
        `SELECT 
                    order_id,
                    username,
                    email,
                    service_complete_datetime
                 FROM users
                 WHERE order_id = ?`,
        [order_id],
      );

      if (orders.length === 0) {
        throw new Error("Order not found");
      }

      const order = orders[0];

      if (!order.service_complete_datetime) {
        throw new Error("Service not yet completed for this order");
      }

      if (!order.email) {
        throw new Error("Customer email not found");
      }

      const feedbackStatus = await tokenService.getFeedbackStatus(order_id);

      if (feedbackStatus.submitted) {
        throw new Error("Feedback already submitted for this order");
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const tokenData = await tokenService.generateFeedbackToken(
        order_id,
        order.email,
        frontendUrl,
        form_type,
      );

      const emailResult = await emailService.sendFeedbackEmail({
        to: order.email,
        customerName: order.username,
        feedbackLink: tokenData.feedback_link,
        orderDate: new Date(
          order.service_complete_datetime,
        ).toLocaleDateString(),
      });

      return {
        success: true,
        message: "Feedback request sent successfully",
        data: {
          order_id: order_id,
          customer_email: order.email,
          feedback_link: tokenData.feedback_link,
          expires_at: tokenData.expires_at,
          email_sent: true,
        },
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async validateFeedbackToken(token) {
    try {
      const validation = await tokenService.validateToken(token);
      return {
        success: true,
        valid: true,
        customer: validation.customer,
      };
    } catch (error) {
      throw error;
    }
  }

  async submitFeedbackWithToken(token, feedbackData) {
    const connection = await pool.getConnection();

    try {
      const order_id = await tokenService.getOrderIdFromToken(token);
      await connection.beginTransaction();

      const updateQuery = `
                UPDATE user_feedback 
                SET 
                    name = ?,
                    experience = ?,
                    buddy_on_time = ?,
                    buddy_courteous = ?,
                    buddy_handling = ?,
                    buddy_pickup = ?,
                    sales_understanding = ?,
                    sales_clarity = ?,
                    sales_professionalism = ?,
                    sales_transparency = ?,
                    sales_followup = ?,
                    sales_decision = ?,
                    cx_onboarding = ?,
                    cx_courteous = ?,
                    cx_resolution = ?,
                    cx_communication = ?,
                    recommendation = ?,
                    tip_asked = ?,
                    tip_details = ?,
                    liked = ?,
                    improvement = ?,
                    feedback_submitted_at = NOW()
                WHERE order_id = ? AND feedback_token = ?
            `;

      const values = [
        feedbackData.name,
        feedbackData.experience,
        feedbackData.buddy_on_time || null,
        feedbackData.buddy_courteous || null,
        feedbackData.buddy_handling || null,
        feedbackData.buddy_pickup || null,
        feedbackData.sales_understanding || null,
        feedbackData.sales_clarity || null,
        feedbackData.sales_professionalism || null,
        feedbackData.sales_transparency || null,
        feedbackData.sales_followup || null,
        feedbackData.sales_decision || null,
        feedbackData.cx_onboarding || null,
        feedbackData.cx_courteous || null,
        feedbackData.cx_resolution || null,
        feedbackData.cx_communication || null,
        feedbackData.recommendation,
        feedbackData.tip_asked,
        feedbackData.tip_details || null,
        feedbackData.liked || null,
        feedbackData.improvement || null,
        order_id,
        token,
      ];

      const [result] = await connection.query(updateQuery, values);

      if (result.affectedRows === 0) {
        await connection.rollback();
        throw new Error("Failed to submit feedback - no records updated");
      }

      await tokenService.invalidateToken(token, connection);
      await connection.commit();

      this.syncFeedbackToGoogleSheets(order_id, feedbackData).catch((err) => {
        console.error("Google Sheets sync failed:", err.message);
      });

      return {
        success: true,
        message: "Feedback submitted successfully",
        data: {
          submitted_at: new Date(),
        },
      };
    } catch (error) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async syncFeedbackToGoogleSheets(order_id, feedbackData) {
    try {
      const connection = await pool.getConnection();
      const [records] = await connection.query(
        `SELECT * FROM user_feedback WHERE order_id = ?`,
        [order_id],
      );
      connection.release();

      if (records.length > 0) {
        await googleSheetsService.saveFeedback({
          ...records[0],
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Google Sheets sync error:", error.message);
    }
  }

  async getStatistics() {
    const connection = await pool.getConnection();

    try {
      const [stats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_feedbacks,
                    COUNT(CASE WHEN feedback_submitted_at IS NOT NULL THEN 1 END) as submitted_feedbacks,
                    COUNT(CASE WHEN feedback_sent_at IS NOT NULL THEN 1 END) as sent_feedbacks,
                    AVG(CASE WHEN recommendation IS NOT NULL THEN recommendation END) as avg_recommendation,
                    COUNT(CASE WHEN experience = 'excellent' THEN 1 END) as excellent_count,
                    COUNT(CASE WHEN experience = 'good' THEN 1 END) as good_count,
                    COUNT(CASE WHEN experience = 'average' THEN 1 END) as average_count,
                    COUNT(CASE WHEN experience = 'poor' THEN 1 END) as poor_count,
                    COUNT(CASE WHEN experience = 'very_poor' THEN 1 END) as very_poor_count
                FROM user_feedback
            `);

      return stats[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllFeedbacks() {
    const connection = await pool.getConnection();

    try {
      const [feedbacks] = await connection.query(`
                SELECT 
                    uf.*,
                    u.username,
                    u.mobile,
                    u.address,
                    u.service_start_datetime
                FROM user_feedback uf
                LEFT JOIN users u ON uf.order_id = u.order_id
                ORDER BY uf.created_at DESC
            `);

      return feedbacks;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getFormStatistics() {
    const connection = await pool.getConnection();

    try {
      const [formStats] = await connection.query(`
                SELECT 
                    form_type,
                    COUNT(*) as response_count
                FROM user_feedback
                WHERE form_type IS NOT NULL AND feedback_submitted_at IS NOT NULL
                GROUP BY form_type
            `);

      const totalForms = 5;
      const formTypes = [
        "ticket_closure",
        "customer_satisfaction",
        "cutomer_feedback",
        "churn_feedback",
        "relocation_feedback",
      ];

      const formData = formTypes.map((type) => {
        const stat = formStats.find((s) => s.form_type === type);
        return {
          form_type: type,
          response_count: stat ? stat.response_count : 0,
        };
      });

      return {
        total_forms: totalForms,
        form_statistics: formData,
        total_responses: formStats.reduce(
          (sum, stat) => sum + stat.response_count,
          0,
        ),
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new FeedbackService();
