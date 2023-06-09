import { Request, Response } from 'express';
import MyModel from '../models/myModel';

// Get all
export const getAllMyModels = async (req: Request, res: Response) => {
  try {
    const myModels = await MyModel.find();
    res.status(200).json(myModels);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'An error occurred';
    res.status(500).json({ message: errMessage });
  }
};

// Get specific one
export const getMyModel = async (req: Request, res: Response) => {
  try {
    const myModel = await MyModel.findById(req.params.id);
    if (myModel == null) {
      return res.status(404).json({ message: 'Cannot find myModel' });
    }
    res.status(200).json(myModel);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'An error occurred';
    res.status(500).json({ message: errMessage });
  }
};

// Create
export const createMyModel = async (req: Request, res: Response) => {
  const myModel = new MyModel({
    title: req.body.title,
    description: req.body.description,
    items: req.body.items
  });
  try {
    const newMyModel = await myModel.save();
    res.status(201).json(newMyModel);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'An error occurred';
    res.status(400).json({ message: errMessage });
  }
};

// Update
export const updateMyModel = async (req: Request, res: Response) => {
  try {
    const updatedMyModel = await MyModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedMyModel);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'An error occurred';
    res.status(400).json({ message: errMessage });
  }
};

// Delete
export const deleteMyModel = async (req: Request, res: Response) => {
  try {
    await MyModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'MyModel deleted' });
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'An error occurred';
    res.status(500).json({ message: errMessage });
  }
};
