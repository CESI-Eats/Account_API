import { AppDataSource } from "../data-source";
import { Restorer } from "../entity/Restorer";
import { Address } from "../entity/Address";
import { MessageLapinou, handleTopic, initExchange, initQueue, sendMessage } from "../services/lapinouService";

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

        initQueue(exchange, 'create.restorer.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let restorer = await AppDataSource.manager.findOneBy(Restorer, {id: message.content.id});
                    if (restorer) {
                        await sendMessage({success: false, content: 'Restorer already exist', correlationId: message.correlationId}, message.replyTo);
                        return;
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

                    await sendMessage({success: true, content: 'Account created', correlationId: message.correlationId}, message.replyTo);
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

                    await sendMessage({success: true, content: 'Account updated', correlationId: message.correlationId}, message.replyTo);
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
                        await sendMessage({success: false, content: 'Cannot find restorer', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }

                    const address = restorer.address;

                    // Dissocier l'adresse du restorer
                    restorer.address = null;

                    await AppDataSource.manager.save(restorer);
                    // Supprimer l'adresse associée
                    await AppDataSource.manager.remove(Address, address);

                    // Supprimer le restorer
                    await AppDataSource.manager.remove(Restorer, restorer);

                    await sendMessage({success: true, content: 'Account deleted', correlationId: message.correlationId}, message.replyTo);
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
}