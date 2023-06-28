import {createRestorerExchange} from './exchanges/restorerExchange';
import {connectLapinou} from './services/lapinouService';
import {createUserExchange} from "./exchanges/userExchange";
import {createDeliveryManExchange} from "./exchanges/deliverymanExchange";
import {createOrderingExchange} from './exchanges/orderingExchange';
import {createHistoricExchange} from "./exchanges/historicExchange";
import {createOrdersExchange} from "./exchanges/ordersExchange";

export function initLapinou() {
    connectLapinou().then(async () => {
        createUserExchange();
        createRestorerExchange();
        createDeliveryManExchange();
        createOrderingExchange();
        createHistoricExchange();
        createOrdersExchange();
    }).catch((error) => console.log('Failed to connect to Lapinou.', error));
}
