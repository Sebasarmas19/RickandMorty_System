// auth.js
// Handles Login, Registration, and Password Recovery

document.addEventListener('DOMContentLoaded', () => {
    // Check if users array exists, if not create dummy admin
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            { name: 'Admin', email: 'admin@ucab.edu', password: 'password123' }
        ]));
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const recoverForm = document.getElementById('recover-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (recoverForm) {
        recoverForm.addEventListener('submit', handleRecover);
    }
});

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'characters.html';
    } else {
        showAlert('alert-container', 'Invalid email or password');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showAlert('alert-container', 'Passwords do not match');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === email)) {
        showAlert('alert-container', 'Email is already registered');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert('alert-container', 'Account created successfully! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function handleRecover(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (user) {
        showAlert('alert-container', 'Password recovery link has been sent to your email (simulated).', 'success');
    } else {
        showAlert('alert-container', 'No account found with that email address.');
    }
}
