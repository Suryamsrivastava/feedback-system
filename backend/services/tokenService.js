const { pool } = require("../config/database");
const TokenGenerator = require("../utils/tokenGenerator");

class TokenService {
  async generateFeedbackToken(order_id, email, frontendUrl) {
    const connection = await pool.getConnection();

    try {
      const token = TokenGenerator.generateSecureToken(8);
      const expirationDate = TokenGenerator.generateExpirationDate(72);
      const feedbackLink = `${frontendUrl}/feedback?token=${token}`;

      const [existing] = await connection.query(
        "SELECT id, feedback_submitted_at FROM user_feedback WHERE order_id = ?",
        [order_id],
      );

      if (existing.length > 0 && existing[0].feedback_submitted_at) {
        throw new Error("Feedback already submitted for this order");
      }

      if (existing.length > 0) {
        await connection.query(
          `UPDATE user_feedback 
                     SET feedback_token = ?, 
                         feedback_link = ?, 
                         feedback_sent_at = NOW(),
                         token_expires_at = ?
                     WHERE order_id = ?`,
          [token, feedbackLink, expirationDate, order_id],
        );
      } else {
        await connection.query(
          `INSERT INTO user_feedback 
                     (order_id, email, feedback_token, feedback_link, feedback_sent_at, token_expires_at) 
                     VALUES (?, ?, ?, ?, NOW(), ?)`,
          [order_id, email, token, feedbackLink, expirationDate],
        );
      }

      return {
        token,
        feedback_link: feedbackLink,
        expires_at: expirationDate,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async validateToken(token) {
    const connection = await pool.getConnection();

    try {
      const [feedbackRecords] = await connection.query(
        `SELECT 
                    uf.id,
                    uf.order_id,
                    uf.email,
                    uf.feedback_submitted_at,
                    uf.token_expires_at,
                    u.username,
                    u.mobile,
                    u.service_complete_datetime
                 FROM user_feedback uf
                 LEFT JOIN users u ON uf.order_id = u.order_id
                 WHERE uf.feedback_token = ?`,
        [token],
      );

      if (feedbackRecords.length === 0) {
        throw new Error("Invalid or expired feedback token");
      }

      const record = feedbackRecords[0];

      if (record.feedback_submitted_at) {
        throw new Error("Feedback already submitted for this token");
      }

      if (TokenGenerator.isTokenExpired(record.token_expires_at)) {
        throw new Error("Feedback token has expired");
      }

      return {
        valid: true,
        customer: {
          name: record.username,
          email: record.email,
          mobile: record.mobile,
          service_date: record.service_complete_datetime,
        },
        _internal_order_id: record.order_id,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async invalidateToken(token, existingConnection = null) {
    const connection = existingConnection || (await pool.getConnection());

    try {
      await connection.query(
        `UPDATE user_feedback 
                 SET feedback_token = NULL
                 WHERE feedback_token = ?`,
        [token],
      );

      return true;
    } catch (error) {
      throw error;
    } finally {
      if (!existingConnection) {
        connection.release();
      }
    }
  }

  async getOrderIdFromToken(token) {
    const connection = await pool.getConnection();

    try {
      const [records] = await connection.query(
        `SELECT order_id, feedback_submitted_at 
                 FROM user_feedback 
                 WHERE feedback_token = ?`,
        [token],
      );

      if (records.length === 0) {
        throw new Error("Invalid token");
      }

      if (records[0].feedback_submitted_at) {
        throw new Error("Token already used");
      }

      return records[0].order_id;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getFeedbackStatus(order_id) {
    const connection = await pool.getConnection();

    try {
      const [records] = await connection.query(
        `SELECT 
                    feedback_sent_at,
                    feedback_submitted_at,
                    feedback_link
                 FROM user_feedback 
                 WHERE order_id = ?`,
        [order_id],
      );

      if (records.length === 0) {
        return {
          sent: false,
          submitted: false,
        };
      }

      return {
        sent: !!records[0].feedback_sent_at,
        submitted: !!records[0].feedback_submitted_at,
        sent_at: records[0].feedback_sent_at,
        submitted_at: records[0].feedback_submitted_at,
        link: records[0].feedback_link,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new TokenService();
