const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    full_name: String,
    email: String,
    phone: String,
    address: String
});

module.exports = mongoose.model("Customer", customerSchema);
