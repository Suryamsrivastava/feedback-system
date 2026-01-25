const { pool } = require('../config/database');
const googleSheetsService = require('../services/googleSheetsService');

class FeedbackController {
    async submitFeedback(req, res) {
        const connection = await pool.getConnection();
        
        try {
            const {
                order_id,
                name,
                email,
                service_complete_datetime,
                experience,
                buddy_on_time,
                buddy_courteous,
                buddy_handling,
                buddy_pickup,
                sales_understanding,
                sales_clarity,
                sales_professionalism,
                sales_transparency,
                sales_followup,
                sales_decision,
                cx_onboarding,
                cx_courteous,
                cx_resolution,
                cx_communication,
                recommendation,
                tip_asked,
                tip_details,
                liked,
                improvement
            } = req.body;

            if (!order_id || !name || !experience || recommendation === undefined || !tip_asked) {
                return res.status(400).json({
                    success: false,
                    message: 'Required fields are missing: order_id, name, experience, recommendation, tip_asked'
                });
            }

            const [userExists] = await connection.query(
                'SELECT order_id, email, service_complete_datetime FROM users WHERE order_id = ?',
                [order_id]
            );

            if (userExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order ID not found in users table'
                });
            }

            const [existingFeedback] = await connection.query(
                'SELECT id FROM user_feedback WHERE order_id = ?',
                [order_id]
            );

            if (existingFeedback.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Feedback already submitted for this order'
                });
            }

            const feedbackEmail = email || userExists[0].email;
            const feedbackServiceDateTime = service_complete_datetime || userExists[0].service_complete_datetime;

            await connection.beginTransaction();

            const insertQuery = `
                INSERT INTO user_feedback (
                    order_id, name, email, service_complete_datetime,
                    experience,
                    buddy_on_time, buddy_courteous, buddy_handling, buddy_pickup,
                    sales_understanding, sales_clarity, sales_professionalism, 
                    sales_transparency, sales_followup, sales_decision,
                    cx_onboarding, cx_courteous, cx_resolution, cx_communication,
                    recommendation, tip_asked, tip_details, liked, improvement
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                order_id,
                name,
                feedbackEmail,
                feedbackServiceDateTime,
                experience,
                buddy_on_time || null,
                buddy_courteous || null,
                buddy_handling || null,
                buddy_pickup || null,
                sales_understanding || null,
                sales_clarity || null,
                sales_professionalism || null,
                sales_transparency || null,
                sales_followup || null,
                sales_decision || null,
                cx_onboarding || null,
                cx_courteous || null,
                cx_resolution || null,
                cx_communication || null,
                recommendation,
                tip_asked,
                tip_details || null,
                liked || null,
                improvement || null
            ];

            const [result] = await connection.query(insertQuery, values);
            await connection.commit();

            const sheetsData = {
                id: result.insertId,
                order_id,
                name,
                email: feedbackEmail,
                service_complete_datetime: feedbackServiceDateTime,
                experience,
                buddy_on_time: buddy_on_time || '',
                buddy_courteous: buddy_courteous || '',
                buddy_handling: buddy_handling || '',
                buddy_pickup: buddy_pickup || '',
                sales_understanding: sales_understanding || '',
                sales_clarity: sales_clarity || '',
                sales_professionalism: sales_professionalism || '',
                sales_transparency: sales_transparency || '',
                sales_followup: sales_followup || '',
                sales_decision: sales_decision || '',
                cx_onboarding: cx_onboarding || '',
                cx_courteous: cx_courteous || '',
                cx_resolution: cx_resolution || '',
                cx_communication: cx_communication || '',
                recommendation,
                tip_asked,
                tip_details: tip_details || '',
                liked: liked || '',
                improvement: improvement || '',
                created_at: new Date().toISOString()
            };

            try {
                await googleSheetsService.saveFeedback(sheetsData);
            } catch (sheetsError) {
                console.error('Google Sheets save failed but MySQL succeeded:', sheetsError.message);
            }

            return res.status(201).json({
                success: true,
                message: 'Feedback submitted successfully',
                data: {
                    feedback_id: result.insertId,
                    order_id: order_id
                }
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error submitting feedback:', error);

            return res.status(500).json({
                success: false,
                message: 'Failed to submit feedback',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            connection.release();
        }
    }

    async getAllFeedbacks(req, res) {
        try {
            const [feedbacks] = await pool.query(`
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

            return res.status(200).json({
                success: true,
                count: feedbacks.length,
                data: feedbacks
            });
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch feedbacks',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getFeedbackByOrderId(req, res) {
        try {
            const { order_id } = req.params;

            const [feedback] = await pool.query(`
                SELECT 
                    uf.*,
                    u.username,
                    u.mobile,
                    u.address,
                    u.service_start_datetime
                FROM user_feedback uf
                LEFT JOIN users u ON uf.order_id = u.order_id
                WHERE uf.order_id = ?
            `, [order_id]);

            if (feedback.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Feedback not found for this order'
                });
            }

            return res.status(200).json({
                success: true,
                data: feedback[0]
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch feedback',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getUserByOrderId(req, res) {
        try {
            const { order_id } = req.params;

            const [user] = await pool.query(
                'SELECT * FROM users WHERE order_id = ?',
                [order_id]
            );

            if (user.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order ID not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: user[0]
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch user details',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getStatistics(req, res) {
        try {
            const [stats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_feedbacks,
                    AVG(recommendation) as avg_recommendation,
                    COUNT(CASE WHEN experience = 'excellent' THEN 1 END) as excellent_count,
                    COUNT(CASE WHEN experience = 'good' THEN 1 END) as good_count,
                    COUNT(CASE WHEN experience = 'average' THEN 1 END) as average_count,
                    COUNT(CASE WHEN experience = 'poor' THEN 1 END) as poor_count,
                    COUNT(CASE WHEN experience = 'very-poor' THEN 1 END) as very_poor_count,
                    COUNT(CASE WHEN tip_asked = 'yes' THEN 1 END) as tip_asked_yes,
                    COUNT(CASE WHEN tip_asked = 'no' THEN 1 END) as tip_asked_no
                FROM user_feedback
            `);

            return res.status(200).json({
                success: true,
                data: stats[0]
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new FeedbackController();
