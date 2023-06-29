import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Restorer } from "../entity/Restorer";
import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";

export function createHistoricExchange() {
    initExchange('historic').then(exchange => {
        initQueue(exchange, 'get.accounts.for.deliveryman').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Get restorer
                    let restorer = await AppDataSource.manager.findOne(Restorer, {
                        where: {id: message.content.restorerId},
                        relations: ['address']
                    });
                    if (restorer == null) {
                        throw new Error('Cannot find restorer');
                    }

                    // Get user
                    let user = await AppDataSource.manager.findOne(User, {
                        where: {id: message.content.userId},
                        relations: ['address']
                    });
                    if (user == null) {
                        throw new Error('Cannot find user');
                    }

                    await sendMessage({success: true, content: {restorer: restorer, user: user}, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });
        initQueue(exchange, 'get.users.restorers.and.catalogs').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Get restorer
                    let restorer = await AppDataSource.manager.findOne(Restorer, {
                        where: {id: message.content.restorerId},
                        relations: ['address']
                    });

                    // Get user
                    let user = await AppDataSource.manager.findOne(User, {
                        where: {id: message.content.userId},
                        relations: ['address']
                    });

                    await sendMessage({success: true, content: {restorer: restorer, user: user}, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });
    });
}