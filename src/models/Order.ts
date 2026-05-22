import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    policeStation: { type: String },
    city: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
  },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  status: { type: String, enum: ['Pending', 'Processing', 'Delivered'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
