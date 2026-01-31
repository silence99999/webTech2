const Order = require("../models/Order");

exports.getAllOrders = async (req, res) => {
    res.json(await Order.find()
        .populate("customer_id")
        .populate("order_items.product_id")
    );
};

exports.getOrderById = async (req, res) => {
    res.json(await Order.findById(req.params.id)
        .populate("customer_id")
        .populate("order_items.product_id")
    );
};

exports.createOrder = async (req, res) => {
    res.status(201).json(await Order.create(req.body));
};

exports.updateOrder = async (req, res) => {
    res.json(
        await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
};

exports.deleteOrder = async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
};
