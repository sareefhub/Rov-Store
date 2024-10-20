document.querySelector('form').addEventListener('submit', function (event) {
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
            // Save token in local storage
            localStorage.setItem('jwt_token', data.token);
            // Redirect or show success message
            window.location.href = '/admin/dashboard'; // หรือหน้าอื่นๆ
        } else {
            // Show error message
            Swal.fire({
                icon: 'error',
                title: 'เข้าสู่ระบบไม่สำเร็จ',
                text: data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            });
        }
    })
    .catch(error => console.error('Error:', error));
});
