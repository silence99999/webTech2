const Order = require("../models/Order");

const Customer = require("../models/Customer");

exports.getAllOrders = async (req, res) => {
    let filter = {};


    if (req.user.role !== "admin") {
        const customer = await Customer.findOne({ user_id: req.user.id });

        if (!customer) {
            return res.json([]);
        }

        filter.customer_id = customer._id;
    }

    const orders = await Order.find(filter)
        .populate("customer_id")
        .populate("order_items.product_id");

    res.json(orders);
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

exports.addItemToOrder = async (req, res) => {
    const { product_id, quantity, unit_price } = req.body;

    await Order.updateOne(
        { _id: req.params.id },
        {
            $push: {
                order_items: { product_id, quantity, unit_price }
            },
            $inc: {
                total_amount: quantity * unit_price
            }
        }
    );

    res.json({ message: "Item added to order" });
};

exports.removeItemFromOrder = async (req, res) => {
    await Order.updateOne(
        { _id: req.params.id },
        {
            $pull: {
                order_items: { product_id: req.params.productId }
            }
        }
    );

    res.json({ message: "Item removed from order" });
};

exports.getRevenueByProduct = async (req, res) => {
    const result = await Order.aggregate([
        { $unwind: "$order_items" },

        {
            $group: {
                _id: "$order_items.product_id",
                revenue: {
                    $sum: {
                        $multiply: [
                            "$order_items.quantity",
                            "$order_items.unit_price"
                        ]
                    }
                }
            }
        },

        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },

        { $unwind: "$product" },

        {
            $project: {
                _id: 0,
                productName: "$product.name",
                revenue: 1
            }
        }
    ]);

    res.json(result);
};

exports.getOrdersPerCustomer = async (req, res) => {
    const result = await Order.aggregate([
        {
            $group: {
                _id: "$customer_id",
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: "$total_amount" }
            }
        }
    ]);

    res.json(result);
};

const User = require("../models/User");
const Product = require("../models/Product");


exports.placeOrder = async (req, res) => {
    try {

        if (req.user.role === "admin") {
            return res.status(403).json({ message: "Admins cannot place orders" });
        }

        const { items, customerData } = req.body;


        let customer = await Customer.findOne({ user_id: req.user.id });

        if (!customer) {
            if (!customerData) {
                return res.status(400).json({
                    message: "Customer data required",
                    requireCustomerData: true
                });
            }

            const user = await User.findById(req.user.id);

            customer = await Customer.create({
                user_id: req.user.id,
                full_name: customerData.full_name,
                phone: customerData.phone,
                address: customerData.address,
                email: user.email
            });
        }


        for (const item of items) {
            const product = await Product.findById(item.product_id);

            if (!product) {
                return res.status(400).json({ message: "Product not found" });
            }

            if (item.quantity <= 0) {
                return res.status(400).json({ message: "Invalid quantity" });
            }

            if (item.quantity > product.stock_quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}`
                });
            }
        }


        const total = items.reduce(
            (sum, item) => sum + item.quantity * item.unit_price,
            0
        );

        const order = await Order.create({
            order_date: new Date(),
            order_status: "pending",
            total_amount: total,
            customer_id: customer._id,
            order_items: items
        });

        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { stock_quantity: -item.quantity } }
            );
        }

        res.status(201).json(order);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to place order" });
    }
};
