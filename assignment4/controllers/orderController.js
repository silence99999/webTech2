const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getAllOrders = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
    const sortField = req.query.sort || "order_date";
    const sortDir = req.query.order === "asc" ? 1 : -1;

    const allowedSort = new Set(["order_date", "total_amount", "order_status"]);
    const filter = {};

    if (req.user.role !== "admin") {
        filter.user_id = req.user.id;
    } else if (req.query.userId) {
        filter.user_id = req.query.userId;
    }

    if (req.query.status) {
        filter.order_status = req.query.status;
    }

    if (req.query.from || req.query.to) {
        filter.order_date = {};
        if (req.query.from) filter.order_date.$gte = new Date(req.query.from);
        if (req.query.to) filter.order_date.$lte = new Date(req.query.to);
    }

    const sort = {};
    sort[allowedSort.has(sortField) ? sortField : "order_date"] = sortDir;

    const [items, total] = await Promise.all([
        Order.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user_id", "email role")
            .populate("order_items.product_id"),
        Order.countDocuments(filter)
    ]);

    res.json({
        page,
        limit,
        total,
        items
    });
};

exports.getOrderById = async (req, res) => {
    res.json(await Order.findById(req.params.id)
        .populate("user_id", "email role")
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

exports.updateOrderStatusByUser = async (req, res) => {
    const { status } = req.body;
    const allowed = new Set(["paid", "cancelled"]);

    if (!allowed.has(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user_id) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "paid"].includes(order.order_status)) {
        return res.status(400).json({ message: "Order cannot be updated" });
    }

    if (order.order_status === "paid" && status === "paid") {
        return res.status(400).json({ message: "Order already paid" });
    }

    order.order_status = status;
    await order.save();

    res.json(order);
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

exports.placeOrder = async (req, res) => {
    try {

        if (req.user.role === "admin") {
            return res.status(403).json({ message: "Admins cannot place orders" });
        }

        const { items } = req.body;


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
            user_id: req.user.id,
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
