const Order = require('../models/order');
const OrderItems = require('../models/order_items');

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