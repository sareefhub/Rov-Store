// JavaScript to handle image enlargement
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const captionText = document.getElementById('caption');
const closeBtn = document.getElementsByClassName('close')[0];

document.querySelectorAll('.expandable-image').forEach(img => {
    img.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    });
});

// Close the modal
closeBtn.onclick = function() { 
    modal.style.display = 'none';
};

// Close modal when clicking outside the image
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
