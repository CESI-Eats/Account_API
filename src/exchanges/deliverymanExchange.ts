import {AppDataSource} from "../data-source";
import {Deliveryman} from "../entity/Deliveryman";
import {Address} from "../entity/Address";
import {MessageLapinou, handleTopic, initExchange, initQueue, sendMessage} from "../services/lapinouService";

export function createDeliveryManExchange() {
    initExchange('deliverymans').then(exchange => {
        initQueue(exchange, 'get.deliverymans.accounts').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let deliverymans = await AppDataSource.manager.find(Deliveryman, {relations: ['address']});

                    if (deliverymans == null) {
                        throw new Error("Cannot find deliverymans");
                    }
                    await sendMessage({
                        success: true,
                        content: deliverymans,
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
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

        initQueue(exchange, 'get.deliveryman.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let deliveryman = await AppDataSource.manager.findOne(Deliveryman, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });

                    if (deliveryman == null) {
                        throw new Error("Cannot find deliveryman");
                    }
                    await sendMessage({
                        success: true,
                        content: deliveryman,
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
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

        initQueue(exchange, 'create.deliveryman.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let deliveryman = await AppDataSource.manager.findOneBy(Deliveryman, {id: message.content.id});
                    if (deliveryman) {
                        throw new Error("Deliveryman already exist");
                    }

                    // Create the new user
                    deliveryman = new Deliveryman();
                    deliveryman.id = message.content.id;
                    deliveryman.firstName = message.content.firstName
                    deliveryman.name = message.content.name;
                    deliveryman.birthday = message.content.birthday;
                    deliveryman.phoneNumber = message.content.phoneNumber;
                    deliveryman.kitty = 0;
                    deliveryman.available = true;

                    const address = new Address();
                    address.street = message.content.address.street;
                    address.postalCode = message.content.address.postalCode;
                    address.city = message.content.address.city;
                    address.country = message.content.address.country;

                    deliveryman.address = address;

                    // Associate the address with the user
                    await AppDataSource.manager.save(address);

                    // Save the new user
                    await AppDataSource.manager.save(deliveryman);

                    await sendMessage({
                        success: true,
                        content: 'Deliveryman created',
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
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

        initQueue(exchange, 'update.deliveryman.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const deliveryman = await AppDataSource.manager.findOne(Deliveryman, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });

                    deliveryman.firstName = message.content.firstName
                    deliveryman.name = message.content.name;
                    deliveryman.birthday = message.content.birthday;
                    deliveryman.phoneNumber = message.content.phoneNumber;
                    deliveryman.available = message.content.available;

                    const address = new Address();
                    address.street = message.content.address.street;
                    address.postalCode = message.content.address.postalCode;
                    address.city = message.content.address.city;
                    address.country = message.content.address.country;

                    deliveryman.address = address;
                    // Save the new user
                    await AppDataSource.manager.save(address);
                    await AppDataSource.manager.save(deliveryman);

                    await sendMessage({
                        success: true,
                        content: deliveryman,
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
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

        initQueue(exchange, 'delete.deliveryman.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    let deliveryman = await AppDataSource.manager.findOne(Deliveryman, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });
                    if (!deliveryman) {
                        throw new Error("Cannot find deliveryman");
                    }

                    const address = deliveryman.address;

                    // Dissocier l'adresse du user
                    deliveryman.address = null;

                    await AppDataSource.manager.save(deliveryman);
                    // Supprimer l'adresse associée
                    await AppDataSource.manager.remove(Address, address);

                    // Supprimer le user
                    await AppDataSource.manager.remove(Deliveryman, deliveryman);

                    await sendMessage({
                        success: true,
                        content: 'Account deleted',
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
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
        initQueue(exchange, 'collect.deliveryman.kitty').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let deliveryman = await AppDataSource.manager.findOne(Deliveryman, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });

                    if (deliveryman == null) {
                        throw new Error('Cannot find restorer');
                    }
                    deliveryman.kitty = 0;
                    await AppDataSource.manager.save(deliveryman);
                    await sendMessage({
                        success: true,
                        content: {kitty: deliveryman.kitty},
                        correlationId: message.correlationId,
                        sender: 'account'
                    }, message.replyTo);
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