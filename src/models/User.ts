import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  image: { type: String },
  addresses: [{
    type: { type: String, default: 'Home' },
    name: { type: String },
    address: { type: String },
    city: { type: String },
    phone: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
