const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_date: {type:Date,default:Date.now},
    order_status: { type: String,default: "pending"},
    total_amount: Number,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    order_items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number,
            unit_price: Number
        }
    ]
});

module.exports = mongoose.model("Order", orderSchema);
