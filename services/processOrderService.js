const amqp = require("amqplib");
const Order = require("../models/order");
const OrderItems = require("../models/order_items");
const { getVendorUserId, getOrCreateAddress } = require("../utils/sequelizeUtils");
const { sendOrderConfirmationMail } = require("./orderMailService");
const { sequelize } = require("../config/dbConfig");
const { QueryTypes } = require("sequelize");

const ORDER_QUEUE = "orders";
const NOTIFICATION_QUEUE = "notifications";

exports.processOrders = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(ORDER_QUEUE, { durable: true });
        console.log(`✅ Listening for orders in queue: ${ORDER_QUEUE}`);

        channel.consume(ORDER_QUEUE, async (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                console.log("📥 Received Order:", orderData);

                const { payment_id, user_id, items, shippingDetails } = orderData;
                const { street, city, state, country, pincode } = shippingDetails;
                try {
                    // Calculating the total price
                    let total_price = 0;
                    items.forEach(item => {
                        total_price += item.price * item.quantity;
                    });

                    const address_id = await getOrCreateAddress(street, city, state, country, pincode); 
                    const order = await Order.create({
                        user_id,
                        total_amount: total_price,
                        address_id,
                        payment_id,
                        delivery_date: new Date(new Date().setDate(new Date().getDate() + 10))
                    });

                    // Insert into OrderItems table
                    const orderItems = items.map(item => ({
                        order_id: order.order_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.price,
                        subtotal: item.price * item.quantity
                    }));

                    await OrderItems.bulkCreate(orderItems);
                    console.log("✅ Order Saved to Database");

                    // Notify Vendors
                    for (const item of items) {
                        const vendor_user_id = await getVendorUserId(item.product_id);

                        if (vendor_user_id) {
                            const notification = {
                                user_id: vendor_user_id,
                                title: `New Order`,
                                message: `New Order Received: ${item.quantity} x ${item.name}`
                            };

                            // Send notification to RabbitMQ
                            channel.sendToQueue(
                                NOTIFICATION_QUEUE,
                                Buffer.from(JSON.stringify(notification)),
                                { persistent: true }
                            );
                            console.log("📨 Sent Notification to Vendor:", notification);
                        }
                    }

                    // Acknowledge the message
                    channel.ack(msg);
                    
                    // fetching user mail address
                    const query = `SELECT c.email FROM auth_app_customuser c WHERE c.id = :user_id`;
                    const result = await sequelize.query(query, {
                        replacements: { user_id },  
                        type: QueryTypes.SELECT,
                    });
                    
                    // Extract email from the first result
                    const userEmail = result.length > 0 ? result[0].email : null;
                    
                    if (!userEmail) {
                        console.error("❌ No email found for user:", user_id);
                        return;
                    }
                    // Send Order confirmation mail to the customer
                    await sendOrderConfirmationMail({
                        to: userEmail,
                        order_id: order.order_id,
                        totalAmount: order.total_amount,
                        deliveryDate: order.delivery_date.toDateString()
                    });
                } catch (error) {
                    console.error("❌ Error processing order:", error.message);
                    channel.nack(msg, false, true); // Requeue message on failure
                }
            }
        });
    } catch (error) {
        console.error("❌ Error connecting to RabbitMQ:", error.message);
    }
};
