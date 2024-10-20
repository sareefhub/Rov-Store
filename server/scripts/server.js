// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // สำหรับจัดการ JWT
const bcrypt = require('bcryptjs'); // สำหรับ hashing รหัสผ่าน

const app = express();
const port = 3000;

// กำหนด secret key สำหรับ JWT (ควรใช้ environment variables สำหรับความปลอดภัยใน production)
const JWT_SECRET = 'your_jwt_secret_key';

// ข้อมูล admin (รหัสผ่านควรจะถูกเข้ารหัสแบบ hashing)
const adminUser = {
    username: 'admin',
    password: bcrypt.hashSync('@@Admin123', 8)  // hashing รหัสผ่าน
};

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

// Function to verify JWT token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => { // ตรวจสอบ token
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

    // ตรวจสอบ username และ password
    if (username !== adminUser.username || !bcrypt.compareSync(password, adminUser.password)) {
        return res.status(401).json({ message: 'Invalid credentials!' });
    }

    // สร้าง JWT token เมื่อ login สำเร็จ
    const token = jwt.sign({ id: adminUser.username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
        message: 'Login successful!',
        token: token // ส่ง token กลับไป
    });
});

// Update the JSON file (optional)
const updateProductsFile = () => {
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
};

// Add new item (requires JWT token)
app.post('/admin/add-item', verifyToken, (req, res) => {
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

// Edit item (requires JWT token)
app.put('/admin/edit-item/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;
    products = products.map((item) => (item.id === parseInt(id) ? { ...item, ...updatedItem } : item));
    updateProductsFile(); // Update the JSON file
    res.json({ message: 'แก้ไขสินค้าสำเร็จ!' });
});

// Delete item (requires JWT token)
app.delete('/admin/delete-item/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    products = products.filter((item) => item.id !== parseInt(id));
    updateProductsFile(); // Update the JSON file
    res.json({ message: 'ลบสินค้าสำเร็จ!' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
