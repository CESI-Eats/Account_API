import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import restorersRoutes from './routes/restorersRoutes';
import { AppDataSource } from './data-source'

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running...'));

export default app;
