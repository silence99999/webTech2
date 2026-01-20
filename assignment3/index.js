import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000
const app = express();
app.use(express.json());
app.use(express.static("public"));

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: {type: String, required: true},
        brand: {type: String, required:true},
        price: { type: Number, required: true, min: 1 },
        stock_quantity: {type: Number, required:true,min:0}
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);


async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "online_shop"
        });
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
            console.log(`Access it at: http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
}


app.post("/products",async (req,res)=> {
    try {
        const { name, category, brand, price,stock_quantity } = req.body;

        if (!name || !category || !brand || price === undefined || stock_quantity === undefined) {
            return res.status(400).json({ message: "name/category/brand/stock quantity/price are required" });
        }

        const product = await Product.create(req.body);
        return res.status(201).json({
            message: "successfully created",
            product:product
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

app.get("/products", async (req,res) => {
    try {

        const products = await Product.find()
        if (!products) {
            return res.status(404).json({message:"There is no products"})
        }


        res.status(200).json(products)

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

app.get("/product/:id", async (req,res) => {
    try {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found with this id" });
        }

        res.status(200).json(product)
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})


app.put("/product/:id", async (req,res) => {
    try {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }


        const { name, category, brand, price,stock_quantity } = req.body;

        if (!name || !category || !brand || price === undefined || stock_quantity === undefined) {
            return res.status(400).json({ message: "name/category/brand/stock quantity/price are required" });
        }

        const product = await Product.findByIdAndUpdate(id,req.body,{
            new:true,
            runValidators:true
        })

        if (!product) {
            return res.status(404).json({
                message: "Product not found with this id"
            })
        }

        return res.status(200).json(
            {
                message:"product successfully updated",
                product:product
            }
        )

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})


app.delete("/product/:id",async (req,res) => {
    try {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid product id"});
        }

        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return res.status(404).json({message: "Product not found with this id"})
        }

        return res.status(200).json({
            message: "Product successfully deleted",
            product: product
        })
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

})


start()