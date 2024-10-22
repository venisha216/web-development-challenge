//step 2: connecting to express
const express = require("express");
const app = express();
const cors = require('cors');
const port = process.env.port || 5000;
app.use(express.json());
app.use(cors());
app.listen(port,()=>{
    console.log(`Server is running at port http://localhost:${port}`);
});
const mongoose = require ('mongoose');

//step 1: connect to Database
mongoose.connect('mongodb://localhost/productsDB').then(()=> console.log("MongoDB connected")).catch(err=>console.log("MongoDB connection error:",err));

//step 3: defining product schema and model

const productSchema = new mongoose.Schema({
    product_id: String,
    name: String,
    price: Number,
    description: String,
    stock: Number,
    category: String
});
const Product = mongoose.model('Product', productSchema);

//step 4: setting root url
app.get('/',(req,res)=>res.send("Welcome to the Products Page!"));

//step 5: create route to fetch product data from DB
// Route to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); 
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error while fetching products' });
    }
});





