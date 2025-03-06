const express = require("express");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const router = express.Router();

router.post("/create", authenticateUser, orderController.createOrder);
router.get('/vendor', authenticateUser, authorizeRole('vendor') ,orderController.getOrderedProductOfVendor);
router.get('/admin', authenticateUser, authorizeRole('admin'), orderController.getAllOrders);
router.get("/", authenticateUser, orderController.getAllOrdersByCustomerId);
router.get("/:order_id", authenticateUser, orderController.getOrderItemsByOrderId);
router.put("/:id", authenticateUser, authorizeRole('vendor'), orderController.updateStatusOfOrderItem);

module.exports = router;