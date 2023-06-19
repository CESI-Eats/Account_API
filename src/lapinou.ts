import { Restorer } from './entity/Restorer';
import { MessageLapinou, receiveManyMessages, sendMessage, connectLapinou, initListenTopic, handleTopic } from './services/lapinouService';
import { AppDataSource } from './data-source'

export function initLapinou(){
    connectLapinou().then(async () => {
        const topics = ['get.restorer.account'];

        initListenTopic('account', topics).then(({queue}) => {

            handleTopic(queue, topics[0], async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    // Check if the user already exists
                    let restorer = await AppDataSource.manager.findOne(Restorer, {
                        where: {id: message.content},
                        relations: ['address']
                    });
            
                    if (restorer == null) {
                        await sendMessage({success: false, content: 'Cannot find restorer', correlationId: message.correlationId}, message.replyTo);
                        return;
                    }
                    await sendMessage({success: true, content: restorer, correlationId: message.correlationId}, message.replyTo);
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId}, message.replyTo);
                }
            });

        }).catch((err) => {
            console.error('Failed to listen to topics');
        });

    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}