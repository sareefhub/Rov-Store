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

// Function to load products and clean up unused images
const loadProducts = () => {
    try {
        const data = fs.readFileSync(productsPath, 'utf-8');
        products = JSON.parse(data);
        cleanupUnusedImages(); // Call cleanup after loading products
    } catch (error) {
        console.error('Error reading products file:', error);
    }
};

// Cleanup function to delete unused images
const cleanupUnusedImages = () => {
    const usedImages = new Set();

    // Collect all used images from the products
    products.forEach(product => {
        if (product.image) {
            usedImages.add(product.image);
        }
        product.additionalImages.forEach(image => {
            usedImages.add(image);
        });
    });

    // Read the uploads directory
    fs.readdir(path.join(__dirname, '..', 'uploads'), (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return;
        }

        files.forEach(file => {
            // If the file is not in the used images, delete it
            if (!usedImages.has(file)) {
                const filePath = path.join(__dirname, '..', 'uploads', file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting unused image ${file}:`, err);
                    } else {
                        console.log(`Deleted unused image: ${file}`);
                    }
                });
            }
        });
    });
};

// Call loadProducts initially to populate products and clean up
loadProducts();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
app.post('/admin/add-item', verifyToken, upload.fields([
    { name: 'mainImage' },
    ...Array.from({ length: 25 }, (_, i) => ({ name: `additionalImageFile${i + 1}` }))
]), (req, res) => {
    const newItem = {
        id: products.length + 1,
        image: req.files['mainImage'] ? req.files['mainImage'][0].filename : '', // Save main image filename
        price: req.body.price,
        description: req.body.description,
        additionalImages: []
    };

    // Store additional image filenames
    for (let i = 1; i <= 25; i++) {
        if (req.files[`additionalImageFile${i}`]) {
            newItem.additionalImages.push(...req.files[`additionalImageFile${i}`].map(file => file.filename));
        }
    }

    products.push(newItem);
    updateProductsFile(); // Update the JSON file
    res.status(201).json({ message: 'Product added successfully!', newItem });
});

// Edit item (requires JWT token)
app.put('/admin/edit-item/:id', upload.fields([{ name: 'image' }, { name: 'additionalImages' }]), verifyToken, (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;

    const productIndex = products.findIndex(item => item.id === parseInt(id));
    
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found!' });
    }

    const oldProduct = products[productIndex];

    // Replace old product data with updated data
    products[productIndex] = { ...oldProduct, ...updatedItem };

    if (req.files) {
        // Handle main image upload
        if (req.files.image && req.files.image.length > 0) {
            if (oldProduct.image) {
                // Delete old main image
                try {
                    fs.unlinkSync(path.join(__dirname, 'uploads', oldProduct.image));
                } catch (err) {
                    console.error(`Error deleting old main image: ${err.message}`);
                }
            }
            // Update mainImage with the new file
            products[productIndex].image = req.files.image[0].filename;
        }

        // Handle additional images upload
        if (req.files.additionalImages) {
            // Delete old additional images
            oldProduct.additionalImages.forEach(image => {
                try {
                    fs.unlinkSync(path.join(__dirname, 'uploads', image));
                } catch (err) {
                    console.error(`Error deleting old additional image: ${err.message}`);
                }
            });
            // Update additionalImages with the new files
            products[productIndex].additionalImages = req.files.additionalImages.map(file => file.filename);
        }
    }

    updateProductsFile(); 
    res.json({ message: 'Product updated successfully!', product: products[productIndex] });
});

// Delete item (requires JWT token)
app.delete('/admin/delete-item/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    // Find the product by ID
    const productIndex = products.findIndex((item) => item.id === parseInt(id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found!' });
    }

    // Get the image file name and path
    const product = products[productIndex];
    const imagePath = path.join(__dirname, '..', 'uploads', product.image); // Main image path

    // Delete the product from the array
    products.splice(productIndex, 1); // Remove the product from the array
    updateProductsFile(); // Update the JSON file

    // Delete the main image file from the uploads directory
    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error('Error deleting image:', err);
            return res.status(500).json({ message: 'Product deleted, but failed to delete the image.' });
        }

        // Delete additional images if they exist
        product.additionalImages.forEach(additionalImage => {
            const additionalImagePath = path.join(__dirname, '..', 'uploads', additionalImage);
            fs.unlink(additionalImagePath, (err) => {
                if (err) {
                    console.error('Error deleting additional image:', err);
                }
            });
        });

        // Check if the products array is empty and clean up uploads folder if necessary
        if (products.length === 0) {
            // Optionally, delete any leftover images in uploads if products is empty
            fs.readdir(path.join(__dirname, '..', 'uploads'), (err, files) => {
                if (err) {
                    console.error('Error reading uploads directory:', err);
                } else {
                    files.forEach(file => {
                        const filePath = path.join(__dirname, '..', 'uploads', file);
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error('Error deleting leftover image:', err);
                            }
                        });
                    });
                }
            });
        }

        res.json({ message: 'Product and image deleted successfully!' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
