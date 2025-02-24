const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const router = express.Router();

router.post("/create", authenticateUser, orderController.createOrder);
router.get("/", authenticateUser, orderController.getAllOrdersByCustomerId);
router.get("/:order_id", authenticateUser, orderController.getOrderItemsByOrderId);

module.exports = router;