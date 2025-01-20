document.addEventListener('DOMContentLoaded', function() {
    if (!auth.checkAuthState()) {
        return;
    }

    // Welcome message and logout
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Welcome ${auth.currentUser.username}!`;
    document.getElementById('logoutBtn').addEventListener('click', () => auth.logout());

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Category selection from start quiz button
    document.getElementById('startQuizBtn').addEventListener('click', () => {
        document.getElementById('categoryModel').style.display = 'flex';
    });

    // Category selection from category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').textContent.toLowerCase();
            window.location.href = `quiz.html?category=${category}`;
        });
    });

    // Category selection from pop-up
    document.querySelectorAll('.category-options button').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            window.location.href = `quiz.html?category=${category}`;
        });
    });

    // Close modal when clicking outside
    document.getElementById('categoryModel').addEventListener('click', (e) => {
        if (e.target.id === 'categoryModel') {
            e.target.style.display = 'none';
        }
    });
});