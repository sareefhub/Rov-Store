// node server.js (ในการรันคำสั่ง)

const express = require('express');
const app = express();
const port = 3000;

let products = [
  {
    id: 1,
    image: 'rov_account_1.jpg',
    price: 500,
    description: 'บัญชีที่มี 10 ฮีโร่, 5 สกิน, Rank: Platinum',
  },
];

app.use(express.json());

// อ่านรายการสินค้า
app.get('/products', (req, res) => {
  res.json(products);
});

// เพิ่มสินค้าใหม่
app.post('/admin/add-item', (req, res) => {
  const newItem = req.body;
  products.push(newItem);
  res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ!' });
});

// แก้ไขสินค้า
app.put('/admin/edit-item/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body;
  products = products.map((item) => (item.id === parseInt(id) ? updatedItem : item));
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
