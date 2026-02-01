const Order = require("../models/Order");
const {decode} = require("jsonwebtoken");

exports.getAllOrders = async (req, res) => {
    res.json(await Order.find()
        .populate("user_id")
        .populate("order_items.product_id")
    );
};

exports.getOrderById = async (req, res) => {
    res.json(await Order.findById(req.params.id)
        .populate("user_id")
        .populate("order_items.product_id")
    );
};

exports.createOrder = async (req, res) => {
    try {
        const order = await Order.create({
            ...req.body,
            user_id: req.user.id
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: "Order creation failed" });
    }
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


exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user_id: req.user.id
        }).populate("user_id");

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error loading orders" });
    }
};