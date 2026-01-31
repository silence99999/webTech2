const Product = require("../models/Product");

exports.getAll = async (req, res) => {
    res.json(await Product.find());
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
