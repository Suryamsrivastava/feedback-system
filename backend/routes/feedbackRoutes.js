const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/submit', feedbackController.submitFeedback);
router.get('/all', feedbackController.getAllFeedbacks);
router.get('/order/:order_id', feedbackController.getFeedbackByOrderId);
router.get('/user/:order_id', feedbackController.getUserByOrderId);
router.get('/statistics', feedbackController.getStatistics);

module.exports = router;
