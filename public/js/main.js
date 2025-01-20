document.addEventListener('DOMContentLoaded', function() {
    if (!auth.checkAuthState()) {
        return;
    }

    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Welcome ${auth.currentUser.username}!`;
    document.getElementById('logoutBtn').addEventListener('click', () => auth.logout());

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    document.getElementById('startQuizBtn').addEventListener('click', () => {
        document.getElementById('categoryModel').style.display = 'flex';
    });

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').textContent.toLowerCase();
            window.location.href = `quiz.html?category=${category}`;
        });
    });

    document.querySelectorAll('.category-options button').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            window.location.href = `quiz.html?category=${category}`;
        });
    });

    document.getElementById('categoryModel').addEventListener('click', (e) => {
        if (e.target.id === 'categoryModel') {
            e.target.style.display = 'none';
        }
    });
});