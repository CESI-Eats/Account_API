import * as amqp from 'amqplib/callback_api';
import { Restorer } from '../entity/Restorer';
import { AppDataSource } from '../data-source';

export const connectLapinou = (url: string): Promise<amqp.Channel> => {
    return new Promise((resolve) => {
        amqp.connect(url, (error, connection) => {
            connection.createChannel((error, channel) => {
                channel.assertQueue("reset-restorer-kitty-payment")
                resolve(channel)
            })
        })
    })
}

export const listenLapinou = async (url: string) => {
    await connectLapinou(url).then(channel => {
        channel.consume("reset-restorer-kitty-payment", async (data) => {
            console.log("Received a message from reset-restorer-kitty-payment", data.content.toString());

            const restorer = await AppDataSource.manager.findOne(Restorer, {
                where: {id: String(data.content)},
                relations: ['address']
            });
            restorer.kitty = 0;
            console.log("Restorer updated");
            const updatedRestorer = await AppDataSource.manager.save(restorer);

            channel.ack(data);
            channel.sendToQueue("reset-restorer-kitty-account",Buffer.from(JSON.stringify(updatedRestorer)));
            console.log("Message sent to reset-restorer-kitty-account", updatedRestorer);
        });
      });
}