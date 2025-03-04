const amqp = require("amqplib");
const { Order, OrderItems } = require("../models"); // Import your Sequelize models

const RABBITMQ_URL = "amqp://localhost"; // Replace with actual RabbitMQ URL if needed
const ORDER_QUEUE = "orders";

const processOrders = async () => {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Ensure Queue Exists
        await channel.assertQueue(ORDER_QUEUE, { durable: true });

        console.log("🚀 Order Consumer is listening...");

        channel.consume(ORDER_QUEUE, async (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                console.log("📩 Received Order:", orderData);

                try {
                    // Extract Order Data
                    const { user_id, items, totalAmount} = orderData;

                    let total_price = 0;
                    items.forEach((item) => {
                        total_price += item.price * item.quantity;
                    });

                    // Create Order
                    const order = await Order.create({
                        user_id,
                        total_amount: totalAmount,
                        street_address,
                        city,
                        state,
                        country
                    });

                    // Insert Order Items
                    const orderItems = items.map((item) => ({
                        order_id: order.order_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.price,
                        sub_total: item.price * item.quantity
                    }));
                    await OrderItems.bulkCreate(orderItems);

                    console.log("✅ Order placed successfully:", order);

                    // Acknowledge Message (Remove from Queue)
                    channel.ack(msg);
                    
                } catch (error) {
                    console.error("❌ Error processing order:", error.message);
                    // Do not acknowledge message so it can be retried
                }
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ Consumer Error:", error);
    }
};

export default processOrders;