const Customer = require("../models/Customer");

exports.getAllCustomers = async (req, res) => {
    res.json(await Customer.find());
};

exports.getCustomerById = async (req, res) => {
    res.json(await Customer.findById(req.params.id));
};

exports.createCustomer = async (req, res) => {
    res.status(201).json(await Customer.create(req.body));
};

exports.updateCustomer = async (req, res) => {
    res.json(
        await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
};

exports.deleteCustomer = async (req, res) => {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
};
