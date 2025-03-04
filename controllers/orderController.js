const Order = require('../models/order');
const OrderItems = require('../models/order_items');
const { getOrderedProductsForVendorUser } = require("../utils/sequelizeUtils");

// Create an order
exports.createOrder = async (req, res) => {
    try{
        const { user_id, items } = req.body;
        let total_price = 0;
        items.forEach((item) => {
            total_price += item.price * item.quantity;
        });

        const order = await Order.create({
            user_id,
            total_amount: total_price,
            street_address,
            city,
            state,
            country
        });

        const orderItems = items.map((item) => ({
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            sub_total: item.price * item.quantity
        }));
        await OrderItems.bulkCreate(orderItems);

        return res.status(201).json({
            success: true,
            message: "Order is placed successfully"
        });
    }catch(error){
        console.error("Error in creating a new order", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to place an Order"
        });
    }
};

// Get all the orders of the Customer
exports.getAllOrdersByCustomerId = async (req, res) => {
    try{
        const user_id  = req.user.user_id;
        const orders = await Order.findAll({ where: { user_id: user_id }});
        return res.status(200).json({
            success: true,
            message: "Orders are retrieved successfully",
            orders
        });
    }catch(error){
        console.error("Error in sending an order", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to get orders for the customer"
        });
    }
};

// Get the order items by the order id
exports.getOrderItemsByOrderId = async (req, res) => {
    try{
        const { order_id } = req.params;
        const order_items = await OrderItems.findOne({ where: { order_id: order_id }});
        return res.status(200).json({
            success: true,
            message: "All order-items are retrieved successfully",
            order_items
        });
    }catch(error){
        console.error("Error in retreiving the order- items", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve all the order-items"
        });
    }
};

// Get the ordered products for the Vendor
exports.getOrderedProductOfVendor = async (req, res) => {
    try {
        const user_id  = req.user.user_id; // Ensure user is authenticated
        console.log('Request User ID:', user_id); // Log user_id for debugging

        const orderedProducts = await getOrderedProductsForVendorUser(user_id);
        console.log('Ordered Products:', orderedProducts); // Log the result

        if (!orderedProducts.length) {
            return res.status(404).json({
                success: false,
                message: 'No ordered products found for this vendor.',
            });
        }

        return res.status(200).json({
            success: true,
            orderedProducts,
        });

    } catch (error) {
        console.error('Error fetching ordered products for vendor:', error.message);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
};

exports.updateStatusOfOrderItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required" });
        }

        const updatedOrder = await OrderItems.update(
            { status },
            { where: { order_item_id: id } }
        );

        if (!updatedOrder[0]) {
            return res.status(404).json({ success: false, message: "Order item not found" });
        }

        return res.status(200).json({ success: true, message: "Order status updated successfully" });
    } catch (error) {
        console.error("❌ Error updating order status:", error.message);
        return res.status(500).json({ success: false, message: "Failed to update order status", error: error.message });
    }
};
