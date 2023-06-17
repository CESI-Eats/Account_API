import * as amqp from 'amqplib/callback_api';

export interface MessageLapinou {
    success: boolean;
    content: any;
}

let conn: amqp.Connection;
let ch: amqp.Channel;

export async function connectLapinou(): Promise<void> {
    return new Promise((resolve, reject) => {
        amqp.connect(String(process.env.LAPINOU_URI), (err, connection) => {
            if (err) {
                console.error(`Failed to connect: ${err}`);
                reject(err);
                return;
            }
            conn = connection;

            // Create channel
            conn.createChannel((err, channel) => {
                if (err) {
                    console.error(`Failed to create channel: ${err}`);
                    conn.close();
                    reject(err);
                    return;
                }
                ch = channel;
                resolve();
            });
        });
    });
}


export function sendMessage(message: MessageLapinou, queueName: string): void {
    // Declare the queue
    ch.assertQueue(queueName, { durable: true });

    // Convert message object to Buffer
    const buffer = Buffer.from(JSON.stringify(message));

    // Send message to the queue
    ch.sendToQueue(queueName, buffer);
    console.log(`Message sent: ${JSON.stringify(message)}`);
}

export function receiveManyMessages(queueName: string, callback: (message: MessageLapinou) => void): void {
    // Declare the queue
    ch.assertQueue(queueName, { durable: true });

    // Wait for Queue Messages
    console.log(` [*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
    ch.consume(queueName, msg => {
        if (msg !== null) {
            const message: MessageLapinou = JSON.parse(msg.content.toString());
            callback(message);
        }
    }, { noAck: true });
}

export function receiveOneMessage(queueName: string): Promise<MessageLapinou> {
    return new Promise((resolve, reject) => {
        // Declare the queue
        ch.assertQueue(queueName, { durable: true });

        // Wait for Queue Messages
        ch.consume(queueName, (msg) => {
            if (msg !== null) {
                const message: MessageLapinou = JSON.parse(msg.content.toString());

                // Get consumer tag
                const consumerTag = msg.fields.consumerTag;

                if (consumerTag) {
                    // Cancel the consumer after receiving the first message
                    ch.cancel(consumerTag, (err) => {
                        if (err) {
                            console.error(`Failed to cancel consumer: ${err}`);
                            reject(err);
                        } else {
                            resolve(message);
                        }
                    });
                } else {
                    console.error(`Failed to get consumerTag`);
                    reject(new Error('Failed to get consumerTag'));
                }
            } else {
                console.error(`Failed to get message`);
                reject(new Error('Failed to get message'));
            }
        }, { noAck: true });
    });
}
