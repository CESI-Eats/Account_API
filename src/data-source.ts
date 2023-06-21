import "reflect-metadata";
import { DataSource } from "typeorm";
import { Address } from "./entity/Address";
import { User } from "./entity/User";
import { Restorer } from "./entity/Restorer";
import { Deliveryman } from "./entity/Deliveryman";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "account_dev",
    synchronize: true,
    logging: false,
    entities: [Address, User, Restorer, Deliveryman],
    migrations: [],
    subscribers: [],
});