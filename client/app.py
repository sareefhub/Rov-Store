import os
import requests
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # เปลี่ยนเป็นรหัสที่ปลอดภัยกว่า

# URL ของเซิร์ฟเวอร์ Express
EXPRESS_SERVER_URL = 'http://localhost:3000/products'  # เปลี่ยนถ้าจำเป็น

# ผู้ใช้ Admin สำหรับการเข้าสู่ระบบ
admin_user = {
    'username': 'admin',
    'password': generate_password_hash('admin123')  # ใช้ hashing สำหรับรหัสผ่านจริง
}

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    response = requests.get(EXPRESS_SERVER_URL)
    if response.status_code != 200:
        return "Error fetching products", 500
    
    products = response.json()
    
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return render_template('product_detail.html', product=product)
    else:
        return "Product not found", 404

@app.route('/products')
def get_products():
    response = requests.get(EXPRESS_SERVER_URL)
    products = response.json()
    return jsonify(products)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == admin_user['username'] and check_password_hash(admin_user['password'], password):
            session['logged_in'] = True
            return redirect(url_for('home'))  # Redirect to the home route instead of 'index'
        else:
            return render_template('login.html', error_message="Login failed!")
    return render_template('login.html')

@app.route('/admin/logout', methods=['POST'])
@login_required
def admin_logout():
    session.pop('logged_in', None)  # Remove the logged-in status from the session
    return redirect(url_for('admin_login'))  # Redirect to the login page

if __name__ == '__main__':
    app.run(port=5000, debug=True)
