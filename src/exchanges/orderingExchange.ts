import { AppDataSource } from "../data-source";
import { Deliveryman } from "../entity/Deliveryman";
import { Restorer } from "../entity/Restorer";
import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";

export function createOrderingExchange() {
    initExchange('ordering').then(exchange => {
        initQueue(exchange, 'order.submitted').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);

                let restorer = await AppDataSource.manager.findOne(Restorer, {
                    where: {id: message.content._idRestorer},
                    relations: ['address']
                });
                if (restorer == null) {
                    throw new Error('Cannot find restorer');
                }
                restorer.kitty += message.content.amount;
                await AppDataSource.manager.save(restorer);
                console.log(`Restorer ${restorer.id} kitty updated to ${restorer.kitty}`);

                let availableDeliveryMan: Deliveryman;
                while (availableDeliveryMan == null) {
                    console.log('Looking for an available deliveryman...')
                    availableDeliveryMan = await AppDataSource.manager.findOne(Deliveryman, {
                        where: {available: true}
                    });
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                }
                availableDeliveryMan.available = false;
                await AppDataSource.manager.save(availableDeliveryMan);

                const orderMessage: MessageLapinou = {
                    success: true,
                    content: {deliveryMan: availableDeliveryMan, _idUser: message.content._idUser, _idOrder: message.content._id}
                };
                await publishTopic('ordering', 'assigned.deliveryman.order', orderMessage);

                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
        initQueue(exchange, 'order.delivered').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);

                let deliveryman = await AppDataSource.manager.findOne(Deliveryman, {
                    where: {id: message.content._idDeliveryMan},
                    relations: ['address']
                });
                if (deliveryman == null) {
                    throw new Error('Cannot find deliveryman');
                }
                deliveryman.kitty += message.content.deliveryAmount;
                deliveryman.available = true;
                await AppDataSource.manager.save(deliveryman);
                console.log(`Deliveryman ${deliveryman.id} kitty updated to ${deliveryman.kitty}`);

                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
    });
}