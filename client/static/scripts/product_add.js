// Add product form submission
document.getElementById('add-product-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const token = localStorage.getItem('jwt_token'); // Use JWT token for authentication

    // Create a unique ID for the product
    const newProductId = Date.now(); // Using timestamp as a unique ID

    const newProduct = {
        id: newProductId, // Add the ID to the product object
        image: '',
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        additionalImages: [],
    };

    const mainImageFile = document.getElementById('mainImageUpload').files[0];
    if (mainImageFile) {
        const mainImageFilename = `idrovimage_${newProductId}.jpg`; // Specify filename for main image
        newProduct.image = `https://shorturl.asia/${mainImageFilename}`; // Change this line to use your actual image URL
    }

    // Collect additional images and generate structured filenames
    const additionalImageFiles = document.getElementById('additionalImagesUpload').files;
    if (additionalImageFiles.length > 25) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You can only upload a maximum of 25 additional images.'
        });
        return;
    }

    for (let i = 0; i < additionalImageFiles.length; i++) {
        const file = additionalImageFiles[i];
        const additionalImageFilename = `idrovimage_${newProductId}_${i + 1}.${file.name.split('.').pop()}`; // Specify filenames for additional images
        newProduct.additionalImages.push(`https://shorturl.asia/${additionalImageFilename}`); // Change this line to use your actual image URL
    }

    // Handle file uploads
    const formData = new FormData();
    if (mainImageFile) {
        formData.append('mainImage', mainImageFile);
    }
    Array.from(additionalImageFiles).forEach((file, index) => {
        formData.append(`additionalImageFile${index + 1}`, file);
    });

    // Append price and description to formData
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);

    fetch(`${API_URL}/admin/add-item`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` // Authorization header
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Product added successfully!'
        }).then(() => {
            window.location.href = '/'; // Redirect to home page after adding
        });
    })
    .catch(error => {
        console.error('Error adding product:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error adding product: ' + error.message
        });
    });
});

// Preview main image upload
document.getElementById('mainImageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('mainImagePreview');
        img.src = e.target.result;
        img.style.display = 'block'; // Show the image preview
    }
    if (file) {
        reader.readAsDataURL(file);
    }
});

// Update remaining images message and display additional image previews
document.getElementById('additionalImagesUpload').addEventListener('change', function(event) {
    const selectedFiles = event.target.files;
    const remainingImages = 25 - selectedFiles.length;
    const remainingImagesMessage = document.getElementById('remainingImagesMessage');

    if (remainingImages < 0) {
        remainingImagesMessage.textContent = 'คุณได้อัพโหลดรูป 25 ภาพแล้ว';
    } else {
        remainingImagesMessage.textContent = `คุณสามารถอัพโหลดรูปภาพเพิ่มเติมได้อีก ${remainingImages} รูป`;
    }

    // Clear previous previews
    const additionalImagesPreview = document.getElementById('additionalImagesPreview');
    additionalImagesPreview.innerHTML = '';

    // Display previews for selected additional images
    Array.from(selectedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Additional Image Preview';
            img.classList.add('additional-image-preview');
            additionalImagesPreview.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
});
