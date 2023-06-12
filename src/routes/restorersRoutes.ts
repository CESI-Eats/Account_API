import express from 'express';
import * as restorersController from '../controllers/restorersController';

const router = express.Router();

router.get('/', restorersController.getAllRestorers);
router.get('/:id', restorersController.getRestorer);
router.post('/', restorersController.createRestorer);
router.put('/:id', restorersController.updateRestorer);
router.delete('/:id', restorersController.deleteRestorer);

export default router;
