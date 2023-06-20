import { createRestorerExchange } from './exchanges/restorerExchange';
import { connectLapinou } from './services/lapinouService';
import {createUserExchange} from "./exchanges/userExchange";

export function initLapinou(){
    connectLapinou().then(async () => {
        createUserExchange();
        createRestorerExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}