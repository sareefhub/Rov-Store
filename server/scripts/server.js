const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer'); // Import multer

const app = express();
const port = 3000;

const JWT_SECRET = 'your_jwt_secret_key';

const adminUser = {
    username: 'admin',
    password: bcrypt.hashSync('@@Admin123', 8) // Hashing the password
};

// Load product data from JSON file
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
let products = [];

// Function to load products
const loadProducts = () => {
    try {
        const data = fs.readFileSync(productsPath, 'utf-8');
        products = JSON.parse(data);
    } catch (error) {
        console.error('Error reading products file:', error);
    }
};

loadProducts();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files statically

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Save with unique filename
    }
});

const upload = multer({ storage: storage });

// Read product list
app.get('/products', (req, res) => {
    res.json(products);
});

// JWT token verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Admin login route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== adminUser.username || !bcrypt.compareSync(password, adminUser.password)) {
        return res.status(401).json({ message: 'Invalid credentials!' });
    }

    const token = jwt.sign({ id: adminUser.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
        message: 'Login successful!',
        token: token
    });
});

// Update the JSON file
const updateProductsFile = () => {
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
};

// Add new item (requires JWT token)
app.post('/admin/add-item', verifyToken, upload.fields([{ name: 'mainImage' }, { name: 'additionalImageFile1' }, { name: 'additionalImageFile2' }, { name: 'additionalImageFile3' }, { name: 'additionalImageFile4' }, { name: 'additionalImageFile5' }]), (req, res) => {
    const newItem = {
        id: products.length + 1,
        image: req.files['mainImage'] ? req.files['mainImage'][0].filename : '', // Save main image filename
        price: req.body.price,
        description: req.body.description,
        additionalImages: req.files['additionalImageFile1'] ? req.files['additionalImageFile1'].map(file => file.filename) : [] // Save additional images filenames
    };

    products.push(newItem);
    updateProductsFile(); // Update the JSON file
    res.status(201).json({ message: 'Product added successfully!', newItem });
});

// Edit item (requires JWT token)
app.put('/admin/edit-item/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;

    products = products.map((item) => (item.id === parseInt(id) ? { ...item, ...updatedItem } : item));
    updateProductsFile(); // Update the JSON file
    res.json({ message: 'Product updated successfully!' });
});

// Delete item (requires JWT token)
app.delete('/admin/delete-item/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    products = products.filter((item) => item.id !== parseInt(id));
    updateProductsFile(); // Update the JSON file
    res.json({ message: 'Product deleted successfully!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
