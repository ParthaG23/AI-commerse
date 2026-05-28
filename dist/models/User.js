"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var AddressSchema = new mongoose_1.Schema({
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
}, { _id: false });
var UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    passwordHash: { type: String, required: true, select: false },
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
exports.default = mongoose_1.models.User || (0, mongoose_1.model)("User", UserSchema);
