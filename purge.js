const amqp = require('amqplib');

async function purgeQueue() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queueName = 'orders'; // Replace with your queue name

        await channel.assertQueue(queueName, { durable: true });
        await channel.purgeQueue(queueName);
        console.log(`✅ Queue "${queueName}" has been cleared.`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("❌ Error purging queue:", error);
    }
}

purgeQueue();
