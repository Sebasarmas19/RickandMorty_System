// app.js
// Handles common layout features like Theme switching and Auth protection

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupAuthProtection();
    registerServiceWorker();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        });
    });
    
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        if (theme === 'dark') {
            toggle.innerHTML = '<svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>';
        } else {
            toggle.innerHTML = '<svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
        }
    });
}

function setupAuthProtection() {
    const isAuthPage = ['index.html', 'register.html', 'recover.html'].some(page => window.location.pathname.endsWith(page)) || window.location.pathname.endsWith('/');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser && !isAuthPage) {
        // Redirect to login if not authenticated and not on an auth page
        window.location.href = 'index.html';
    } else if (currentUser && isAuthPage) {
        // Redirect to dashboard if authenticated and on an auth page
        window.location.href = 'characters.html';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function showAlert(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type}">
            ${type === 'error' ? '⚠️' : '✅'} ${message}
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 4000);
}
