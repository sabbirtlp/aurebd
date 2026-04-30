import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "Customer" },
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  image: { type: String, default: "/images/user-placeholder.png" },
  language: { type: String, default: "en" }, // "en" or "bn"
}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
