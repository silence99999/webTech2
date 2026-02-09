const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.create({
            email,
            password,
            role: "user"
        });

        res.status(201).json({
            id: user._id,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        res.status(500).json({
            message: "Registration failed"
        });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne(
        {
            email
        });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
};
