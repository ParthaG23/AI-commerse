import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    default: 0,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
  },
  subcategory: {
    type: String,
    trim: true,
    index: true,
  },
  stock: {
    type: Number,
    required: [true, 'Please provide product stock'],
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
    },
  ],
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
