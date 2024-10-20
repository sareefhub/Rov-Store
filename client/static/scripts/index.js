// Check client-side storage for logged-in status
if (sessionStorage.getItem('logged_in')) {
    // If the user is logged in, display the admin username and logout button
    document.getElementById('admin-username').textContent = sessionStorage.getItem('username'); // Set username
    document.getElementById('admin-username').style.display = 'inline'; // Show username
    document.getElementById('logout-form').style.display = 'inline'; // Show logout button
}

// Fetch products from the server
fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
        const productList = document.getElementById('product-list');
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <img src="${product.image}" alt="Rov Account ${product.id}">
                <h2>ราคา: ${product.price} บาท</h2>
                <p>รายละเอียด: ${product.description}</p>
                <a href="/product/${product.id}" class="details-button">ดูรายละเอียดเพิ่มเติม</a>
                ${sessionStorage.getItem('logged_in') ? `
                    <div class="button-group">
                        <button class="edit-button" onclick="editProduct(${product.id})">แก้ไข</button>
                        <button class="delete-button" onclick="confirmDelete(${product.id})">ลบ</button>
                    </div>` : ''}
            `;
            productList.appendChild(productDiv);
        });
    })
    .catch(error => console.error('Error fetching products:', error));

// Function to handle edit product
function editProduct(productId) {
    window.location.href = `/admin/edit-item/<int:item_id>`;
}

// Function to confirm deletion
function confirmDelete(productId) {
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบสินค้านี้?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`http://localhost:3000/admin/delete-item/${productId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Deleted!', 'สินค้านี้ถูกลบเรียบร้อยแล้ว.', 'success');
                } else {
                    Swal.fire('Error!', 'ไม่สามารถลบสินค้าได้.', 'error');
                }
            })
            .catch(error => console.error('Error deleting product:', error));
        }
    });
}

// Function to handle logout
function logout() {
    fetch('/admin/logout', {
        method: 'POST'
    })
    .then(() => {
        // Clear session storage and redirect to login page
        localStorage.removeItem('jwt_token'); // Clear the JWT token
        localStorage.removeItem('username'); // Clear the username
        sessionStorage.removeItem('logged_in');
        sessionStorage.removeItem('username'); // Clear username
        window.location.href = '/admin/login';
    })
    .catch(error => console.error('Logout error:', error));
}