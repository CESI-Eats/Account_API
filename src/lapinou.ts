import { createRestorerExchange } from './exchanges/restorerExchange';
import { connectLapinou } from './services/lapinouService';
import {createUserExchange} from "./exchanges/userExchange";
import {createDeliveryManExchange} from "./exchanges/deliverymanExchange";

export function initLapinou(){
    connectLapinou().then(async () => {
        createUserExchange();
        createRestorerExchange();
        createDeliveryManExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}