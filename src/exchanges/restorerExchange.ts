import { AppDataSource } from "../data-source";
import { Restorer } from "../entity/Restorer";
import { Address } from "../entity/Address";
import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";
import { v4 as uuidv4 } from 'uuid';

export function createRestorerExchange(){
    initExchange('restorers').then(exchange => {
        initQueue(exchange, 'get.restorers.accounts').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let restorers = await AppDataSource.manager.find(Restorer, {relations: ['address']});

                    if (restorers == null) {
                        throw new Error('Cannot find restorers');
                    }
                    await sendMessage({success: true, content: restorers, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });
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
                        throw new Error('Cannot find restorer');
                    }
                    await sendMessage({success: true, content: restorer, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });
        initQueue(exchange, 'create.restorer.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let restorer = await AppDataSource.manager.findOneBy(Restorer, {id: message.content.id});
                    if (restorer) {
                        throw new Error('Restorer already exist');
                    }

                    // Create the new restorer
                    restorer = new Restorer();
                    restorer.id = message.content.id;
                    restorer.name = message.content.name;
                    restorer.phoneNumber = message.content.phoneNumber;
                    restorer.kitty = 0;

                    const address = new Address();
                    address.street = message.content.address.street;
                    address.postalCode = message.content.address.postalCode;
                    address.city = message.content.address.city;
                    address.country = message.content.address.country;

                    restorer.address = address;

                    // Associate the address with the restorer
                    await AppDataSource.manager.save(address);

                    // Save the new restorer
                    const newRestorer = await AppDataSource.manager.save(restorer);

                    await sendMessage({success: true, content: 'Account created', correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });

        initQueue(exchange, 'update.restorer.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    const restorer = await AppDataSource.manager.findOne(Restorer, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });

                    restorer.name = message.content.name;
                    restorer.phoneNumber = message.content.phoneNumber;

                    const address = restorer.address;
                    restorer.address.street = message.content.address.street;
                    restorer.address.postalCode = message.content.address.postalCode;
                    restorer.address.city = message.content.address.city;
                    restorer.address.country = message.content.address.country;

                    // Save the new restorer
                    await AppDataSource.manager.save(address);
                    await AppDataSource.manager.save(restorer);

                    await sendMessage({success: true, content: 'Account updated', correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });


        initQueue(exchange, 'delete.restorer.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    let restorer = await AppDataSource.manager.findOne(Restorer, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });
                    if (!restorer) {
                        throw new Error('Cannot find restorer');
                    }

                    const address = restorer.address;

                    // Dissocier l'adresse du restorer
                    restorer.address = null;

                    await AppDataSource.manager.save(restorer);
                    // Supprimer l'adresse associée
                    await AppDataSource.manager.remove(Address, address);

                    // Supprimer le restorer
                    await AppDataSource.manager.remove(Restorer, restorer);

                    await sendMessage({success: true, content: 'Account deleted', correlationId: message.correlationId, sender: 'account'}, message.replyTo);
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
                    
                    const replyQueue = 'pay.restorer.kitty.reply';
                    const correlationId = uuidv4();
                    const paymentMessage: MessageLapinou = {
                        success: true,
                        content: {id: message.content.id, amount: restorer.kitty, mode: message.content.mode},
                        correlationId: correlationId,
                        replyTo: replyQueue
                    };
                    await publishTopic('restorers', 'pay.restorer.kitty', paymentMessage);
                    const responses = await receiveResponses(replyQueue, correlationId, 1);
                    if (responses.length === 0 || !responses[0].success) {
                        throw new Error(responses.length === 0 ? 'No response received' : responses[0].content);
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
}