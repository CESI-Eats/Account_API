import mongoose from 'mongoose';

// Define schema for myModel
const MyModelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Export model
export default mongoose.model('MyModel', MyModelSchema);
