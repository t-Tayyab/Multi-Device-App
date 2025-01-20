document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            sessionStorage.setItem('currentUser', JSON.stringify({ username: data.username }));
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorMessage.textContent = 'Server error. Please try again.';
    }
});
