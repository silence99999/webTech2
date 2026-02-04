const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_date: Date,
    order_status: String,
    total_amount: Number,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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

orderSchema.index({ user_id: 1, order_date: -1 });

module.exports = mongoose.model("Order", orderSchema);
