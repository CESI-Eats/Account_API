import { createRestorerExchange } from './exchanges/restorerExchange';
import { connectLapinou } from './services/lapinouService';

export function initLapinou(){
    connectLapinou().then(async () => {
        createRestorerExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}