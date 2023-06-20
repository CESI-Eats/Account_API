import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Address} from "../entity/Address";
import {MessageLapinou, handleTopic, initExchange, initQueue, sendMessage} from "../services/lapinouService";

export function createUserExchange() {
    initExchange('users').then(exchange => {
        initQueue(exchange, 'get.users.accounts').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let users = await AppDataSource.manager.find(User, {relations: ['address']});

                    if (users == null) {
                        await sendMessage({success: false, content: 'Cannot find user', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }
                    await sendMessage({success: true, content: users, correlationId: message.correlationId}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });

        initQueue(exchange, 'get.user.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let user = await AppDataSource.manager.findOne(User, {
                        where: {id: message.content.id},
                        relations: ['address']
                    });

                    if (user == null) {
                        await sendMessage({success: false, content: 'Cannot find user', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }
                    await sendMessage({success: true, content: user, correlationId: message.correlationId}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
        });

        initQueue(exchange, 'create.user.account').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let user = await AppDataSource.manager.findOneBy(User, {id: message.content.id});
                    if (user) {
                        await sendMessage({success: false, content: 'User already exist', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }

                    // Create the new user
                    user = new User();
                    user.id = message.content.id;
                    user.firstName = message.content.firstName
                    user.name = message.content.name;
                    user.birthday = message.content.birthday;
                    user.phoneNumber = message.content.phoneNumber;

                    const address = new Address();
                    address.street = message.content.address.street;
                    address.postalCode = message.content.address.postalCode;
                    address.city = message.content.address.city;
                    address.country = message.content.address.country;

                    user.address = address;

                    // Associate the address with the user
                    await AppDataSource.manager.save(address);

                    // Save the new user
                    await AppDataSource.manager.save(user);

                    await sendMessage({success: true, content: 'Account created', correlationId: message.correlationId}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                }
            });
            initQueue(exchange, 'update.user.account').then(({queue, topic}) => {
                handleTopic(queue, topic, async (msg) => {
                    const message = msg.content as MessageLapinou;
                    try {
                        const user = await AppDataSource.manager.findOne(User, {
                            where: {id: message.content.id},
                            relations: ['address']
                        });

                        user.firstName = message.content.firstName
                        user.name = message.content.name;
                        user.birthday = message.content.birthday;
                        user.phoneNumber = message.content.phoneNumber;

                        const address = user.address;
                        user.address.street = message.content.address.street;
                        user.address.postalCode = message.content.address.postalCode;
                        user.address.city = message.content.address.city;
                        user.address.country = message.content.address.country;

                        // Save the new user
                        await AppDataSource.manager.save(address);
                        await AppDataSource.manager.save(user);

                        await sendMessage({success: true, content: 'Account updated', correlationId: message.correlationId}, message.replyTo);
                    } catch (err) {
                        const errMessage = err instanceof Error ? err.message : 'An error occurred';
                        await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                    }
                });
            });

            initQueue(exchange, 'delete.user.account').then(({queue, topic}) => {
                handleTopic(queue, topic, async (msg) => {
                    const message = msg.content as MessageLapinou;
                    try {
                        console.log(` [x] Received message: ${JSON.stringify(message)}`);
                        let user = await AppDataSource.manager.findOne(User, {
                            where: {id: message.content.id},
                            relations: ['address']
                        });
                        if (!user) {
                            await sendMessage({success: false, content: 'Cannot find user', correlationId: message.correlationId}, message.replyTo);
                            return;
                        }

                        const address = user.address;

                        // Dissocier l'adresse du user
                        user.address = null;

                        await AppDataSource.manager.save(user);
                        // Supprimer l'adresse associée
                        await AppDataSource.manager.remove(Address, address);

                        // Supprimer le user
                        await AppDataSource.manager.remove(User, user);

                        await sendMessage({success: true, content: 'Account deleted', correlationId: message.correlationId}, message.replyTo);
                    } catch (err) {
                        const errMessage = err instanceof Error ? err.message : 'An error occurred';
                        await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'account'}, message.replyTo);
                    }
                });
            });
        });
    });
}