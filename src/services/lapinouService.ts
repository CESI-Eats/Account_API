import * as amqp from 'amqplib/callback_api';

export interface MessageLapinou {
    success: boolean;
    content: any;
}

export const connectLapinou = async (queue: string): Promise<amqp.Channel> => {
    return new Promise((resolve, reject) => {
        amqp.connect(process.env.LAPINOU_URI as string, (error, conn) => {
            if (error) {
                reject(error);
            } else {
                conn.createChannel((error, chan) => {
                    if (error) {
                        reject(error);
                    } else {
                        chan.assertQueue(queue);
                        resolve(chan);
                    }
                });
            }
        });
    });
}

export async function sendMessage(
    message: MessageLapinou,
    sendQueue: string
  ): Promise<void> {
    const channel = await connectLapinou(sendQueue);
    channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(message)));
    console.log(`Sent message to ${sendQueue}`, message);
}

export async function receiveMessage<MessageLapinou>(
receiveQueue: string
): Promise<MessageLapinou> {
const channel = await connectLapinou(receiveQueue);
return new Promise<MessageLapinou>((resolve, reject) => {
    channel.consume(receiveQueue, (data) => {
    if (data && data.content) {
        console.log(`Received message from ${receiveQueue}`, data.content.toString());
        channel.ack(data);
        channel.close((err) => {
            if (err) {
                console.error('Error closing channel:', err);
            }
        });
        resolve(JSON.parse(data.content.toString()) as MessageLapinou);
    } else {
        reject(new Error(`Invalid data received from ${receiveQueue}`));
    }
    });
});
}



// import * as amqp from 'amqplib/callback_api';

// export interface MessageLapinou {
//     success: boolean;
//     content: any;
// }

// export const connectLapinou = (queue: string): Promise<amqp.Channel> => {
//     return new Promise((resolve) => {
//         amqp.connect(process.env.LAPINOU_URI as string, (error, connection) => {
//             connection.createChannel((error, channel) => {
//                 channel.assertQueue(queue)
//                 resolve(channel)
//             })
//         })
//     })
// }

// export async function sendMessage(
//     message: MessageLapinou,
//     sendQueue: string
//   ): Promise<void> {
//     const channel = await connectLapinou(sendQueue);
//     channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(message)));
//     console.log(`Sent message to ${sendQueue}`, message);
//     }
  
// export async function receiveMessage<MessageLapinou>(
// receiveQueue: string
// ): Promise<MessageLapinou> {
// const channel = await connectLapinou(receiveQueue);
// return new Promise<MessageLapinou>((resolve, reject) => {
//     channel.consume(receiveQueue, (data) => {
//     if (data && data.content) {
//         console.log(`Received message from ${receiveQueue}`, data.content.toString());
//         channel.ack(data);
//         resolve(JSON.parse(data.content.toString()) as MessageLapinou);
//     } else {
//         reject(new Error(`Invalid data received from ${receiveQueue}`));
//     }
//     });
// });
// }


// import * as amqp from 'amqplib/callback_api';
// import { Restorer } from '../entity/Restorer';
// import { AppDataSource } from '../data-source';

// export const connectLapinou = (url: string): Promise<amqp.Channel> => {
//     return new Promise((resolve) => {
//         amqp.connect(url, (error, connection) => {
//             connection.createChannel((error, channel) => {
//                 channel.assertQueue("reset-restorer-kitty-payment")
//                 resolve(channel)
//             })
//         })
//     })
// }

// export const listenLapinou = async (url: string) => {
//     await connectLapinou(url).then(channel => {
//         channel.consume("reset-restorer-kitty-payment", async (data) => {
//             console.log("Received a message from reset-restorer-kitty-payment", data.content.toString());

//             const restorer = await AppDataSource.manager.findOne(Restorer, {
//                 where: {id: String(data.content)},
//                 relations: ['address']
//             });
//             restorer.kitty = 0;
//             console.log("Restorer updated");
//             const updatedRestorer = await AppDataSource.manager.save(restorer);

//             channel.ack(data);
//             channel.sendToQueue("reset-restorer-kitty-account",Buffer.from(JSON.stringify(updatedRestorer)));
//             console.log("Message sent to reset-restorer-kitty-account", updatedRestorer);
//         });
//       });
// }