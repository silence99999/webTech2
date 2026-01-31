const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    brand: String,
    price: Number,
    stock_quantity: Number
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
