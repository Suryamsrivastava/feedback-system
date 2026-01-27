const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/complete", orderController.completeOrder);

module.exports = router;
