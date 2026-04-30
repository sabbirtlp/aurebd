import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  gallery: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
