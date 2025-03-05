const nodemailer = require("nodemailer");

exports.sendOrderConfirmationMail = async ({ to, order_id, totalAmount, deliveryDate }) => {
    if (!to) {
        console.error("Recipient email is missing!");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `🎉 Your OpulentCart Order #${order_id} is Confirmed!`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; text-align: center;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
                <h2 style="color: #4CAF50;">✅ Order Confirmed!</h2>
                <p style="font-size: 16px; color: #333;">Thank you for shopping with <strong>OpulentCart</strong>! Your order has been placed successfully. 🎉</p>
                
                <div style="margin: 20px 0; text-align: left;">
                    <p><strong>📦 Order ID:</strong> ${order_id}</p>
                    <p><strong>💰 Total Amount:</strong> ₹${totalAmount}</p>
                    <p><strong>🚚 Estimated Delivery:</strong> ${deliveryDate}</p>
                </div>
                
                <a href="https://opulentcart.com/orders/${order_id}" style="display: inline-block; padding: 12px 20px; margin-top: 10px; font-size: 16px; font-weight: bold; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
                    📜 View Your Order
                </a>

                <hr style="margin: 30px 0; border: 0.5px solid #ddd;">

                <p style="font-size: 14px; color: #777;">
                    Need help? <a href="mailto:support@opulentcart.com" style="color: #4CAF50;">Contact Support</a>
                </p>
            </div>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📨 Order confirmation email sent to ${to}`);
};
