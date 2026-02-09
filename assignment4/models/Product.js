const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    brand: String,
    price: Number,
    stock_quantity: Number
}, { timestamps: true });

productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
