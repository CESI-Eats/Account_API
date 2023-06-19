import express from 'express';
import * as restorersController from '../controllers/restorersController';
import {IdentityType} from "../enums/identityType";
import {authorize} from "../middlewares/authorizationMiddleware";

const router = express.Router();

router.get('/',authorize([IdentityType.TECHNICAL, IdentityType.SALES]), restorersController.getAllRestorers);
router.get('/:id', authorize([IdentityType.TECHNICAL, IdentityType.SALES, IdentityType.USER, IdentityType.RESTORER, IdentityType.DELIVERYMAN]) , restorersController.getRestorer);
router.post('/', authorize([IdentityType.TECHNICAL, IdentityType.SALES, IdentityType.RESTORER]), restorersController.createRestorer);
router.put('/:id', authorize([IdentityType.TECHNICAL, IdentityType.SALES, IdentityType.RESTORER]), restorersController.updateRestorer);
router.delete('/:id', authorize([IdentityType.TECHNICAL, IdentityType.SALES, IdentityType.RESTORER]),  restorersController.deleteRestorer);
export default router;
