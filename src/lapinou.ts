import { Restorer } from './entity/Restorer';
import { MessageLapinou, sendMessage, connectLapinou, handleTopic, initExchange, initQueue } from './services/lapinouService';
import { AppDataSource } from './data-source'
import e from 'express';

export function initLapinou(){
    connectLapinou().then(async () => {
        initExchange('restorers').then(exchange => {
            initQueue(exchange, 'get.restorer.account').then(({queue, topic}) => {
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
            initQueue(exchange, 'collect.restorer.kitty').then(({queue, topic}) => {
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
                            throw new Error('Cannot find restorer');
                        }
                        restorer.kitty = 0;
                        await AppDataSource.manager.save(restorer);
                        await sendMessage({success: true, content: {kitty: restorer.kitty}, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                    } catch (err) {
                        const errMessage = err instanceof Error ? err.message : 'An error occurred';
                        await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                    }
                });
            });
        });

    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}