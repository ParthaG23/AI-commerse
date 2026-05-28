"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var ProductSchema = new mongoose_1.default.Schema({
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
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Product || mongoose_1.default.model('Product', ProductSchema);
