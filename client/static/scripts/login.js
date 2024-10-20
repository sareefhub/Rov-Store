// client/static/scripts/login.js
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    fetch('http://localhost:3000/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Save token and username in local storage
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('username', username); // Store the username
            sessionStorage.setItem('logged_in', 'true'); // Store login status
            sessionStorage.setItem('username', username); // Store username
            // Redirect or show success message
            window.location.href = '/'; // หรือหน้าอื่นๆ
        } else {
            // Show error message
            console.error(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Optionally, you can also display the stored username
const storedUsername = localStorage.getItem('username');
if (storedUsername) {
    console.log(`Logged in as: ${storedUsername}`);
}