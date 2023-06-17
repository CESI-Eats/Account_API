import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import restorersRoutes from './routes/restorersRoutes';
import { AppDataSource } from './data-source'
import { MessageLapinou, receiveMessage, sendMessage } from './services/lapinouService';
import { Restorer } from './entity/Restorer';

const app = express();

// Connect to pg
AppDataSource.initialize().then(async () => {
    console.log("Database successfully connected...")
}).catch((error: any) => console.log(error))


// Set JSON format for HTTP requests
app.use(express.json());

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger_output.json')
// Create endpoint
app.get('/', (req, res) => {res.status(200).json({ response: true });});
app.use('/restorers', restorersRoutes);
app.use('/account-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// Listen lapinou
// listenLapinou(process.env.LAPINOU_URI as string);

receiveMessage("reset-restorer-kitty-payment")
    .then(async (data) => {
        const restorer = await AppDataSource.manager.findOne(Restorer, {
            where: {id: String((data as MessageLapinou).content)},
            relations: ['address']
        });
        restorer.kitty = 0;
        const updatedRestorer = await AppDataSource.manager.save(restorer);
        await sendMessage({success: true, content: updatedRestorer.kitty}, "reset-restorer-kitty-account")
    })

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running...'));

export default app;