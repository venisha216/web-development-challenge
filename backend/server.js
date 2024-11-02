//step 2: connecting to express
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const {MongoClient} = require('mongodb');
const port = process.env.port || 5000;
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
let db;
const dbName = 'productsDB';
const Cart = require('./models/cart');
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('C:\\Users\\Srilaya\\Desktop\\wd 20days\\frontend'));
app.listen(port,()=>{
    console.log(`Server is running at port http://localhost:${port}`);
});
const mongoose = require ('mongoose');
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        db = client.db('productsDB'); // Use your actual database name
    })
    .catch(err => console.error('MongoDB connection error:', err));

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


// Serve the sign-up page
app.get('/signup', (req, res) => {
    res.sendFile('C:\\Users\\Srilaya\\Desktop\\wd 20days\\frontend\\signup.html'); // Adjust the path as needed
});
//server the login page
app.get('/login', (req, res) => {
    res.sendFile('C:\\Users\\Srilaya\\Desktop\\wd 20days\\frontend\\login.html');
});
//for sign up page
app.post('/signup', async (req, res) => {
    try {
        console.log("Form data received:", req.body); // Log the received data
        
        const { username, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into the database
        const user = { username, email, password: hashedPassword };
        const db = client.db('productsDB');
        const result = await db.collection('users').insertOne(user);

        console.log("User inserted:", result); // Log the result of the insertion
        res.send('User registered successfully!');
    } catch (error) {
        console.error("Error inserting user:", error); // Log any errors
        res.status(500).send('An error occurred while registering the user.');
    }
});

//for login page
app.post('/login', async (req, res) => {
    console.log("Login request received:", req.body); // Log the request body
    const { email, password } = req.body;
    
    try {
        // Find the user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            return res.json({ 
                success: true, message: 'Login successful' , 
                userId: user._id});
        } else {
            return res.json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


//add to cart functioning
app.post('/add-to-cart', async (req, res) => {
    const { userId, productId } = req.body;

    // Check if the user is logged in
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Please log in to add items to the cart' });
    }

    try {
        // Find the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a new cart for the user if it doesn't exist
            cart = new Cart({ userId, items: [{ productId, quantity: 1 }] });
        } else {
            // Check if the product already exists in the cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // If the product is already in the cart, increase the quantity
                cart.items[itemIndex].quantity += 1;
            } else {
                // If the product is not in the cart, add it as a new item
                cart.items.push({ productId, quantity: 1 });
            }
        }

        // Save the cart
        await cart.save();
        res.json({ success: true, message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ success: false, message: 'An error occurred while adding the item to the cart' });
    }
});






