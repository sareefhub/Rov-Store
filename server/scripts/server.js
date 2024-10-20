// server.js

// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Load product data from JSON file
const productsPath = path.join(__dirname, '..', 'data', 'products.json'); // Adjust the path accordingly
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

// Call the function to load products when the server starts
loadProducts();

app.use(cors());
app.use(express.json());

// Read product list
app.get('/products', (req, res) => {
    res.json(products);
});

// Update the JSON file (optional)
const updateProductsFile = () => {
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
};

// Add new item (consider handling without image upload)
app.post('/admin/add-item', (req, res) => {
    const newItem = {
        id: products.length + 1,
        image: req.body.image, // Just use the image URL from the request body
        price: req.body.price,
        description: req.body.description,
    };
    products.push(newItem);
    updateProductsFile(); // Update the JSON file
    res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ!', newItem });
});

// Edit item
app.put('/admin/edit-item/:id', (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;
    products = products.map((item) => (item.id === parseInt(id) ? { ...item, ...updatedItem } : item));
    updateProductsFile(); // Update the JSON file
    res.json({ message: 'แก้ไขสินค้าสำเร็จ!' });
});

// Delete item
app.delete('/admin/delete-item/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter((item) => item.id !== parseInt(id));
    updateProductsFile(); // Update the JSON file
    res.json({ message: 'ลบสินค้าสำเร็จ!' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
