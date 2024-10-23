const loginForm = document.getElementById('login-form');
const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const togglePassword = document.getElementById('toggle-password');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch(`${API_URL}/admin/login`, {
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
            localStorage.setItem('username', username);
            sessionStorage.setItem('logged_in', 'true');
            sessionStorage.setItem('username', username);
            // Redirect or show success message
            Swal.fire({
                title: 'Login Successful!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/';
            });
        } else {
            // Show error message and clear both fields
            Swal.fire({
                title: 'Login Failed',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'Try Again'
            }).then(() => {
                // Clear both fields after the error
                usernameInput.value = '';  // Clear username
                passwordInput.value = '';  // Clear password
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing your request.',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            // Clear both fields after the error
            usernameInput.value = '';  // Clear username
            passwordInput.value = '';  // Clear password
        });
    });
});

// Toggle password visibility
togglePassword.addEventListener('click', () => {
    // Toggle the type attribute of the password input
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the icon class
    if (type === 'text') {
        togglePassword.classList.remove('bi-eye-slash');
        togglePassword.classList.add('bi-eye');
    } else {
        togglePassword.classList.remove('bi-eye');
        togglePassword.classList.add('bi-eye-slash');
    }
});
