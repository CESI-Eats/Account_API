import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Address} from "../entity/Address";
import {MessageLapinou, handleTopic, initExchange, initQueue, sendMessage} from "../services/lapinouService";
import {In} from "typeorm";
import {Restorer} from "../entity/Restorer";
import {throws} from "assert";

export function createOrdersExchange() {
    initExchange('orders').then(exchange => {
        initQueue(exchange, 'get.users.restorers.and.catalogs').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    if (topic === 'get.users.restorers') {
                        const userIds = message.content.userIds;
                        const restorerIds = message.content.restorerIds;

                        // Retrieve users
                        const users = await AppDataSource.manager.find(User, {
                            where: {id: In(userIds)},
                            relations: ['address']
                        });

                        // Retrieve restorers
                        const restorers = await AppDataSource.manager.find(Restorer, {
                            where: {id: In(restorerIds)},
                            relations: ['address']
                        });

                        await sendMessage({
                            success: true,
                            content: {
                                users: users,
                                restorers: restorers
                            },
                            correlationId: message.correlationId,
                            sender: 'account'
                        }, message.replyTo);
                    } else {
                            throw new Error('Invalid topic');
                    }
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({
                        success: false,
                        content: errMessage,
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
                }
            });
        });
    });
}