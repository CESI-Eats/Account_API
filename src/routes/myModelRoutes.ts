import express from 'express';
import * as myModelController from '../controllers/myModelController';

const router = express.Router();

router.get('/', myModelController.getAllMyModels);
router.get('/:id', myModelController.getMyModel);
router.post('/', myModelController.createMyModel);
router.put('/:id', myModelController.updateMyModel);
router.delete('/:id', myModelController.deleteMyModel);

export default router;
