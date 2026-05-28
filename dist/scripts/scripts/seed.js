"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = __importDefault(require("../lib/mongodb"));
var Product_1 = __importDefault(require("../models/Product"));
var User_1 = __importDefault(require("../models/User")); // Assuming you have a User model for product ownership
var mongoose_1 = __importDefault(require("mongoose"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var products = [
    {
        name: 'Smartphone X',
        description: 'A powerful smartphone with a great camera and long battery life.',
        price: 799.99,
        images: ['/images/smartphone-x-1.jpg', '/images/smartphone-x-2.jpg'],
        category: 'Electronics',
        stock: 50,
        ratings: 4.5,
        reviews: [], // Added empty reviews array
    },
    {
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals and gamers.',
        price: 1299.99,
        images: ['/images/laptop-pro-1.jpg', '/images/laptop-pro-2.jpg'],
        category: 'Electronics',
        stock: 30,
        ratings: 4.8,
        reviews: [], // Added empty reviews array
    },
    {
        name: 'Wireless Headphones',
        description: 'Immersive sound experience with noise-cancelling technology.',
        price: 199.99,
        images: ['/images/headphones-1.jpg', '/images/headphones-2.jpg'],
        category: 'Accessories',
        stock: 100,
        ratings: 4.2,
        reviews: [], // Added empty reviews array
    },
    {
        name: 'Smartwatch 2.0',
        description: 'Track your fitness and stay connected with this stylish smartwatch.',
        price: 249.99,
        images: ['/images/smartwatch-1.jpg', '/images/smartwatch-2.jpg'],
        category: 'Wearables',
        stock: 75,
        ratings: 4.0,
        reviews: [], // Added empty reviews array
    },
    {
        name: '4K UHD TV',
        description: 'Experience stunning visuals with this large 4K Ultra HD television.',
        price: 899.99,
        images: ['/images/tv-1.jpg', '/images/tv-2.jpg'],
        category: 'Electronics',
        stock: 20,
        ratings: 4.7,
        reviews: [], // Added empty reviews array
    },
];
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var adminUser_1, _a, _b, productsWithUser, error_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, mongodb_1.default)()];
                case 1:
                    _d.sent();
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 9, 10, 11]);
                    console.log('Seeding database...');
                    // Clear existing products
                    return [4 /*yield*/, Product_1.default.deleteMany({})];
                case 3:
                    // Clear existing products
                    _d.sent();
                    console.log('Existing products cleared.');
                    return [4 /*yield*/, User_1.default.findOne({ email: 'admin@example.com' })];
                case 4:
                    adminUser_1 = _d.sent();
                    if (!!adminUser_1) return [3 /*break*/, 7];
                    _b = (_a = User_1.default).create;
                    _c = {
                        name: 'Admin User',
                        email: 'admin@example.com'
                    };
                    return [4 /*yield*/, bcryptjs_1.default.hash('password123', 10)];
                case 5: return [4 /*yield*/, _b.apply(_a, [(_c.passwordHash = _d.sent(),
                            _c.role = 'admin',
                            _c)])];
                case 6:
                    adminUser_1 = _d.sent();
                    console.log('Dummy admin user created.');
                    _d.label = 7;
                case 7:
                    productsWithUser = products.map(function (product) { return (__assign(__assign({}, product), { user: adminUser_1._id })); });
                    return [4 /*yield*/, Product_1.default.insertMany(productsWithUser)];
                case 8:
                    _d.sent();
                    console.log('Products seeded successfully!');
                    return [3 /*break*/, 11];
                case 9:
                    error_1 = _d.sent();
                    console.error('Error seeding database:', error_1);
                    return [3 /*break*/, 11];
                case 10:
                    mongoose_1.default.connection.close();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
seedDatabase();
