// nodemon ./scripts/server.js (ในการรันคำสั่ง)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// กำหนดที่เก็บไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // แก้ไขชื่อไฟล์เพื่อป้องกันการซ้ำ
    },
});

const upload = multer({ storage });

// รายการสินค้าเริ่มต้น
let products = [
  {
    id: 1,
    image: 'https://shorturl.asia/f6HPa',
    price: 500,
    description: 'ไอดีสะอาด',
  },
];

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // ให้บริการไฟล์ภาพจากโฟลเดอร์ uploads

// อ่านรายการสินค้า
app.get('/products', (req, res) => {
  res.json(products);
});

// เพิ่มสินค้าใหม่พร้อมไฟล์ภาพ
app.post('/admin/add-item', upload.single('image'), (req, res) => {
  const newItem = {
    id: products.length + 1,
    image: req.file.path,
    price: req.body.price,
    description: req.body.description,
  };
  products.push(newItem);
  res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ!', newItem });
});

// แก้ไขสินค้า
app.put('/admin/edit-item/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body;
  products = products.map((item) => (item.id === parseInt(id) ? { ...item, ...updatedItem } : item));
  res.json({ message: 'แก้ไขสินค้าสำเร็จ!' });
});

// ลบสินค้า
app.delete('/admin/delete-item/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter((item) => item.id !== parseInt(id));
  res.json({ message: 'ลบสินค้าสำเร็จ!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
