import { AppDataSource } from "../data-source";
import { Deliveryman } from "../entity/Deliveryman";
import { Restorer } from "../entity/Restorer";
import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";

export function createOrderingExchange() {
    initExchange('historic').then(exchange => {
        initQueue(exchange, 'get.accounts.for.deliveryman').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let restorers = await AppDataSource.manager.find(Restorer, {relations: ['address']});
                    if (restorers == null) {
                        await sendMessage({success: false, content: 'Cannot find restorer', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }
                    await sendMessage({success: true, content: restorers, correlationId: message.correlationId}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });
        initQueue(exchange, 'get.accounts.for.deliveryman').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let restorer = await AppDataSource.manager.findOne(Restorer, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });

                    if (restorer == null) {
                        await sendMessage({success: false, content: 'Cannot find restorer', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }
                    await sendMessage({success: true, content: restorer, correlationId: message.correlationId}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });
    });
}