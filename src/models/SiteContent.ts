import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema({
  page: { type: String, required: true },    // e.g. "home", "about", "promo"
  section: { type: String, required: true }, // e.g. "hero", "story", "values"
  key: { type: String, required: true },     // e.g. "title", "subtitle", "image"
  value: { type: String, default: "" },
  language: { type: String, default: "en" }, // "en" or "bn"
}, { timestamps: true });

// Compound unique index
SiteContentSchema.index({ page: 1, section: 1, key: 1, language: 1 }, { unique: true });

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
