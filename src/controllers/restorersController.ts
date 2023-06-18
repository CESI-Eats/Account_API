import {Request, Response} from 'express';
import {Restorer} from '../entity/Restorer';
import {AppDataSource} from "../data-source";
import {Address} from "../entity/Address";

// Get all
export const getAllRestorers = async (req: Request, res: Response) => {
    try {
        let restorers = await AppDataSource.manager.find(Restorer, {relations: ['address']});
        res.status(200).json(restorers);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(500).json({message: errMessage});
    }
};

// Get specific one
export const getRestorer = async (req: Request, res: Response) => {
    try {
        // Check if the user already exists
        let restorer = await AppDataSource.manager.findOne(Restorer, {
            where: {id: req.params.id},
            relations: ['address']
        });

        if (restorer == null) {
            return res.status(404).json({message: 'Cannot find myModel'});
        }
        res.status(200).json(restorer);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(500).json({message: errMessage});
    }
};

// Create
export const createRestorer = async (req: Request, res: Response) => {
    try {
        // Check if the user already exists
        let restorer = await AppDataSource.manager.findOneBy(Restorer, {id: (req as any).identityId});

        if (restorer) {
            return res.status(400).json({message: 'User already exists'});
        }

        // Create the new restorer
        restorer = new Restorer();
        restorer.id = (req as any).identityId;
        restorer.name = req.body.name;
        restorer.phoneNumber = req.body.phoneNumber;
        restorer.kitty = 0;

        const address = new Address();
        address.street = req.body.address.street;
        address.postalCode = req.body.address.postalCode;
        address.city = req.body.address.city;
        address.country = req.body.address.country;

        restorer.address = address;

        // Associate the address with the restorer
        await AppDataSource.manager.save(address);

        // Save the new restorer
        const newRestorer = await AppDataSource.manager.save(restorer);

        res.status(201).json(newRestorer);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(400).json({message: errMessage});
    }
};


// Update
export const updateRestorer = async (req: Request, res: Response) => {
    try {
        // Create the new restorer
        const restorer = await AppDataSource.manager.findOne(Restorer, {
            where: {id: req.params.id},
            relations: ['address']
        });

        restorer.name = req.body.name;
        restorer.phoneNumber = req.body.phoneNumber;

        const address = restorer.address;
        restorer.address.street = req.body.address.street;
        restorer.address.postalCode = req.body.address.postalCode;
        restorer.address.city = req.body.address.city;
        restorer.address.country = req.body.address.country;

        // Save the new restorer
        await AppDataSource.manager.save(address);
        const updatedRestorer = await AppDataSource.manager.save(restorer);

        res.status(200).json(updatedRestorer);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(400).json({message: errMessage});
    }
};

// Delete
export const deleteRestorer = async (req: Request, res: Response) => {
    try {
        let restorer = await AppDataSource.manager.findOne(Restorer, {
            where: {id: req.params.id},
            relations: ['address']
        });
        if (!restorer) {
            return res.status(404).json({message: 'Restorer not found'});
        }

        const address = restorer.address;

        // Dissocier l'adresse du restorer
        restorer.address = null;

        await AppDataSource.manager.save(restorer);
        // Supprimer l'adresse associée
        await AppDataSource.manager.remove(Address, address);

        // Supprimer le restorer
        await AppDataSource.manager.remove(Restorer, restorer);

        res.status(200).json({message: 'Restorer and associated address deleted'});
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(500).json({message: errMessage});
    }
};

// Update kitty
export const updateKittyRestorer = async (req: Request, res: Response) => {
    try {
        // get restorer
        const restorer = await AppDataSource.manager.findOne(Restorer, {
            where: {id: req.body.restorerId},
            relations: ['address']
        });
        restorer.kitty += req.body.amount;
        const updatedRestorer = await AppDataSource.manager.save(restorer);
        res.status(200).json(updatedRestorer);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'An error occurred';
        res.status(400).json({message: errMessage});
    }
};