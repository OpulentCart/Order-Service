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

    }
};