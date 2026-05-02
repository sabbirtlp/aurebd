import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Category;
}
export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
