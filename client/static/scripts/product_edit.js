document.getElementById('edit-product-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const productId = "{{ product.id }}";
    const token = localStorage.getItem('jwt_token'); // Admin token for authentication

    // Create FormData for file uploads
    const formData = new FormData(this); // Automatically captures all form fields

    fetch(`http://localhost:3000/admin/edit-item/${productId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        window.location.href = '/'; // Redirect to the home page after saving
    })
    .catch(error => {
        console.error('Error updating product:', error);
    });
});

// Preview new main image upload
document.getElementById('new-mainImageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('new-mainImagePreview');
        img.src = e.target.result;
        img.style.display = 'block'; // Show the image preview
    }
    if (file) {
        reader.readAsDataURL(file);
    }
});

// Preview additional images upload
document.getElementById('new-additionalImagesUpload').addEventListener('change', function(event) {
    const selectedFiles = event.target.files;
    const additionalImagesPreview = document.getElementById('new-additionalImagesPreview');
    additionalImagesPreview.innerHTML = ''; // Clear previous previews

    // Display previews for selected additional images
    Array.from(selectedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'New Additional Image Preview';
            img.classList.add('additional-image-preview');
            additionalImagesPreview.appendChild(img);
        }
        reader.readAsDataURL(file);
    });

    // Update remaining images message
    const remainingImages = 25 - selectedFiles.length;
    const remainingImagesMessage = document.getElementById('remainingImagesMessage');

    if (remainingImages < 0) {
        remainingImagesMessage.textContent = 'คุณได้อัพโหลดรูป 25 ภาพแล้ว';
    } else {
        remainingImagesMessage.textContent = `คุณสามารถอัพโหลดรูปภาพเพิ่มเติมได้อีก ${remainingImages} รูป`;
    }
});
