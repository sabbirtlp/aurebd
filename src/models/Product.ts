import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  gallery: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  reviews: [ReviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Delete cached model in development to ensure schema updates apply
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Product;
}
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
