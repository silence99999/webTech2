const Product = require("../models/Product");

exports.getAll = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const sortField = req.query.sort || "createdAt";
    const sortDir = req.query.order === "asc" ? 1 : -1;

    const allowedSort = new Set([
        "createdAt",
        "price",
        "name",
        "stock_quantity",
        "category",
        "brand"
    ]);

    const filter = {};

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.brand) {
        filter.brand = req.query.brand;
    }

    if (req.query.q) {
        filter.name = { $regex: req.query.q, $options: "i" };
    }

    if (req.query.inStock === "1") {
        filter.stock_quantity = { $gt: 0 };
    }

    const sort = {};
    sort[allowedSort.has(sortField) ? sortField : "createdAt"] = sortDir;

    const [items, total] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit),
        Product.countDocuments(filter)
    ]);

    res.json({
        page,
        limit,
        total,
        items
    });
};

exports.create = async (req, res) => {
    res.json(await Product.create(req.body));
};

exports.update = async (req, res) => {
    res.json(
        await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
};

exports.remove = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
};
