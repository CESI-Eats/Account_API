import { createRestorerExchange } from './exchanges/restorerExchange';
import { connectLapinou } from './services/lapinouService';
import {createUserExchange} from "./exchanges/userExchange";
import {createDeliveryManExchange} from "./exchanges/deliverymanExchange";
import { createOrderingExchange } from './exchanges/orderingExchange';
import {createHistoricExchange} from "./exchanges/historicExchange";

export function initLapinou(){
    connectLapinou().then(async () => {
        createUserExchange();
        createRestorerExchange();
        createDeliveryManExchange();
        createOrderingExchange();
        createHistoricExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}