import mongoose from 'mongoose';

const ReviewImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  altText: { type: String, default: "Happy Customer Review" },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.ReviewImage || mongoose.model('ReviewImage', ReviewImageSchema);
