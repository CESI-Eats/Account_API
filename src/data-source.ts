import "reflect-metadata"
import { DataSource } from "typeorm"
import { Restorer } from "./entity/Restorer"
import {Address} from "./entity/Address";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "password",
    database: "account_dev",
    synchronize: true,
    logging: false,
    entities: [Address, Restorer],
    migrations: [],
    subscribers: [],
})
