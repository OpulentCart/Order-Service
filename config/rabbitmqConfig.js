const amqp = require("amqplib");

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue("orders", { durable: true });
        await channel.assertQueue("notifications", { durable: true });
        console.log("✅ Connected to RabbitMQ");
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
    }
}

function getChannel() {
    return channel;
}

module.exports = { connectRabbitMQ, getChannel };
