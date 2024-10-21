import os
import requests
import jwt
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # เปลี่ยนเป็นรหัสที่ปลอดภัยกว่า

# Secret key for JWT
JWT_SECRET = 'your_jwt_secret_key'
JWT_ALGORITHM = 'HS256'

# URL ของเซิร์ฟเวอร์ Express
EXPRESS_SERVER_URL = 'http://localhost:3000/products'  # เปลี่ยนถ้าจำเป็น

# ผู้ใช้ Admin สำหรับการเข้าสู่ระบบ
admin_user = {
    'username': 'admin',
    'password': generate_password_hash('admin123')  # ใช้ hashing สำหรับรหัสผ่านจริง
}

# Helper function to create JWT token
def create_jwt_token(username):
    expiration = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
    token = jwt.encode({'username': username, 'exp': expiration}, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

# Decorator to require JWT in protected routes
def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization').split(" ")[1]  # Bearer <token>
        if not token:
            return jsonify({'message': 'Missing token'}), 401
        try:
            jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
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
            session['logged_in'] = True  # Set logged in status
            session['username'] = username  # Store username in session
            token = create_jwt_token(username)
            session['token'] = token  # Store token in session

            # Fetch admin user information from the Express server
            headers = {'Authorization': f'Bearer {token}'}
            response = requests.get('http://localhost:3000/admin/user', headers=headers)

            if response.status_code == 200:
                admin_user_data = response.json()  # Get the admin user data
                return jsonify({
                    "token": token,
                    "message": "Login successful!",
                    "admin_user": admin_user_data  # Include admin user data in the response
                }), 200
            else:
                return jsonify({"message": "Login successful, but failed to fetch admin user data!"}), 200
        else:
            return jsonify({"message": "Login failed!"}), 401
    return render_template('login.html')

@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('logged_in', None)  # Remove the logged-in status from the session
    return redirect(url_for('admin_login'))  # Redirect to the login page

@app.route('/product/edit/<int:product_id>', methods=['GET'])
def product_edit(product_id):
    return render_template('product_edit.html', product=product_id)

@app.route('/product/add', methods=['POST'])
def product_add():
    return render_template('product_add.html')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
