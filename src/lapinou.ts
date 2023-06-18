import { Restorer } from './entity/Restorer';
import { MessageLapinou, receiveManyMessages, sendMessage, connectLapinou } from './services/lapinouService';
import { AppDataSource } from './data-source'

export function initLapinou(){
    connectLapinou().then(() => {
        receiveManyMessages('reset-restorer-kitty-payment', async (message) => {
            console.log(`Received message: ${JSON.stringify(message)}`);
            try {
                const restorer = await AppDataSource.manager.findOne(Restorer, {
                    where: {id: String((message as MessageLapinou).content)},
                    relations: ['address']
                });
                restorer.kitty = 0;
                const updatedRestorer = await AppDataSource.manager.save(restorer);
                sendMessage({success: true, content: updatedRestorer.kitty} as MessageLapinou, 'reset-restorer-kitty-account');
            }catch(err){
                sendMessage({success: false, content: err} as MessageLapinou, 'reset-restorer-kitty-account');
            }
        });
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}