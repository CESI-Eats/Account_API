import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from './data-source'
import { initLapinou } from './lapinou';


// Connect to pg
AppDataSource.initialize().then(async () => {
    console.log("Database successfully connected...")
}).catch((error: any) => console.log(error))

// Initialize lapinou
initLapinou();