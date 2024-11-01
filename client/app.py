# pip3 install -r requirements.txt
# python app.py
import os
import requests
import jwt
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change to a more secure key

# Secret key for JWT
JWT_SECRET = 'your_jwt_secret_key'
JWT_ALGORITHM = 'HS256'

# Set Express server URL based on environment
if os.environ.get('FLASK_ENV') == 'development':
    API_PREFIX = 'http://localhost:3000'
else:
    API_PREFIX = 'http://localhost:3000'  # Change to your production URL

@app.route('/config.js')
def config():
    return f"const API_URL = '{API_PREFIX}';"

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
    response = requests.get(f'{API_PREFIX}/products')
    if response.status_code != 200:
        return "Error fetching products", 500
    products = response.json()
    
    # Fetch product details based on product_id
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return render_template('product_detail.html', product=product)
    else:
        return "Product not found", 404

@app.route('/products')
def get_products():
    response = requests.get(f'{API_PREFIX}/products')
    products = response.json()
    return jsonify(products)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Fetch admin user credentials from the Express server
        response = requests.get(f'{API_PREFIX}/admin/user')  # Ensure this endpoint provides the correct credentials
        if response.status_code == 200:
            admin_user = response.json()  # Assuming the response is in the format {'username': 'admin', 'password': 'hashed_password'}

            if username == admin_user['username'] and check_password_hash(admin_user['password'], password):
                session['logged_in'] = True  # Set logged in status
                session['username'] = username  # Store username in session
                token = create_jwt_token(username)
                session['token'] = token  # Store token in session

                # Fetch admin user information from the Express server
                headers = {'Authorization': f'Bearer {token}'}
                response = requests.get(f'{API_PREFIX}/admin/user', headers=headers)

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
        else:
            return jsonify({"message": "Error fetching admin user credentials!"}), 500
    return render_template('login.html')

@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('logged_in', None)  # Remove the logged-in status from the session
    return redirect(url_for('admin_login'))  # Redirect to the login page

@app.route('/product/edit/<int:product_id>', methods=['GET', 'PUT'])
def product_edit(product_id):
    if request.method == 'GET':
        # Fetch product details for editing
        response = requests.get(f'{API_PREFIX}/products')
        if response.status_code != 200:
            return "Error fetching products", 500
        products = response.json()
        
        product = next((p for p in products if p['id'] == product_id), None)
        if product:
            return render_template('product_edit.html', product=product)
        else:
            return "Product not found", 404
    
    elif request.method == 'PUT':
        # Update product details
        updated_product_data = request.json  # Assuming the data is sent as JSON
        
        response = requests.put(f'{API_PREFIX}/products/{product_id}', json=updated_product_data)
        if response.status_code == 200:
            return "Product updated successfully", 200
        else:
            return "Error updating product", 500

@app.route('/product/add', methods=['GET', 'POST'])
def product_add():
    return render_template('product_add.html')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
