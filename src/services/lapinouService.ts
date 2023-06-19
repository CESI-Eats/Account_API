import * as amqp from 'amqplib/callback_api';
import { initLapinou } from '../lapinou';

export interface MessageLapinou {
    success: boolean;
    content: any;
    replyTo?: string;
    correlationId?: string;
    sender?: string;
}


let conn: amqp.Connection;
let connected = false;
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
            connected = true;
            console.log('Connected to rabbitMQ');
            conn.on('close', async () => {
                console.error('Connection to rabbitMQ closed');
                connected = false;
                while (!connected) {
                    console.log('Attempting to reconnect...');
                    initLapinou();
                    if (!connected) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                }
            });
            

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

export async function sendMessage(message: MessageLapinou, queueName: string): Promise<void> {
    if (!connected) {
        throw new Error('Not connected to rabbitMQ');
    }
    // Declare the queue
    ch.assertQueue(queueName, { durable: true });

    // Convert message object to Buffer
    const buffer = Buffer.from(JSON.stringify(message));

    // Send message to the queue
    ch.sendToQueue(queueName, buffer);
    console.log(` [x] Message sent: ${JSON.stringify(message)}`);
}

export function receiveManyMessages(queueName: string, callback: (message: MessageLapinou) => void): void {
    if (!connected) {
        return;
    }
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

export function receiveResponses(queueName: string, expectedCorrelationId: string, expectedResponses: number): Promise<MessageLapinou[]> {
    return new Promise((resolve, reject) => {
        // Declare the queue
        ch.assertQueue(queueName, { durable: true });

        const receivedResponses: MessageLapinou[] = [];

        // Wait for Queue Messages
        ch.consume(queueName, (msg) => {
            if (msg !== null) {
                const message: MessageLapinou = JSON.parse(msg.content.toString());
                console.log(` [x] Received response: ${JSON.stringify(message)}`);
                // Get consumer tag
                const consumerTag = msg.fields.consumerTag;

                // Check if the correlationId matches the expected one
                if (message.correlationId === expectedCorrelationId) {
                    receivedResponses.push(message);

                    if (receivedResponses.length === expectedResponses && consumerTag) {
                        // Cancel the consumer after receiving all expected responses
                        ch.cancel(consumerTag, (err) => {
                            if (err) {
                                console.error(`Failed to cancel consumer: ${err}`);
                                reject(err);
                            } else {
                                resolve(receivedResponses);
                            }
                        });
                    }
                }
            } else {
                console.error(`Failed to get message`);
                reject(new Error('Failed to get message'));
            }
        }, { noAck: true });
    });
}


export async function publishTopic(exchange: string, routingKey: string, message: any): Promise<void> {
    if (!connected) {
        throw new Error('Not connected to rabbitMQ');
    }

    // Declare the exchange
    ch.assertExchange(exchange, 'topic', { durable: false });

    // Convert message object to Buffer
    const buffer = Buffer.from(JSON.stringify(message));

    // Publish message to the exchange with the specified routing key and replyTo property
    ch.publish(exchange, routingKey, buffer);
    console.log(` [x] Sent ${routingKey}:'${JSON.stringify(message)}'`);
}

export async function initListenTopic(exchange: string, keys: string[]): Promise<{queue: string}> {
    if (!connected) {
        throw new Error('Not connected to rabbitMQ');
    }
    // Declare the exchange
    ch.assertExchange(exchange, 'topic', { durable: false });

    // Declare a new queue
    return new Promise((resolve, reject) => {
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            if (err) {
                console.error(`Failed to assert queue: ${err}`);
                reject(err);
                return;
            }

            // For each key in the provided keys, bind the queue to the exchange
            keys.forEach((key) => {
                ch.bindQueue(q.queue, exchange, key);
            });

            resolve(q);
        });
    });
}

export function handleTopic(queue: string, key: string, callback: (msg: MessageLapinou) => void): void {
    if (!connected) {
        throw new Error('Not connected to rabbitMQ');
    }
    // Consume the queue
    ch.consume(queue, (msg) => {
        if (msg !== null && msg.fields.routingKey === key) {
            const message: MessageLapinou = {
                success: true,
                content: JSON.parse(msg.content.toString()),
                replyTo: msg.properties.replyTo,
                correlationId: msg.properties.correlationId,
            };
            callback(message);
        }
    }, { noAck: true });
}