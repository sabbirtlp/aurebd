import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://mstsaharatlp_db_user:Mr6OrCAq1QfjslcA@aureabd.pw4bnlu.mongodb.net/aureabd?retryWrites=true&w=majority&appName=aureabd";

const ReviewImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  altText: { type: String, default: "Happy Customer Review" },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ReviewImage = mongoose.models.ReviewImage || mongoose.model('ReviewImage', ReviewImageSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const images = await ReviewImage.find({});
  console.log("Total images before cleanup:", images.length);
  
  const seenUrls = new Set();
  for (const img of images) {
    if (seenUrls.has(img.imageUrl)) {
      console.log(`Deleting duplicate image: id=${img._id}, order=${img.order}`);
      await ReviewImage.deleteOne({ _id: img._id });
    } else {
      seenUrls.add(img.imageUrl);
    }
  }
  
  const remaining = await ReviewImage.find({});
  console.log("Total images after cleanup:", remaining.length);
  await mongoose.disconnect();
}

main().catch(console.error);
