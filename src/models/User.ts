import { Schema, model, models } from "mongoose";

const AddressSchema = new Schema({
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: "India" },
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: { type: String, required: true, select: false },

  // For AI personalization
  preferences: {
    budgetMin: Number,
    budgetMax: Number,
    likedBrands: [String],
    dislikedBrands: [String],
    useCases: [String],
  },

  addresses: [AddressSchema],

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, { timestamps: true });

export default models.User || model("User", UserSchema);
