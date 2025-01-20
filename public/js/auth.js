const auth = {
    isLoggedIn: false,
    currentUser: null,

    checkAuthState() {
        const user = sessionStorage.getItem('currentUser');
        if (user) {
            this.isLoggedIn = true;
            this.currentUser = JSON.parse(user);
            return true;
        }
        window.location.href = 'login.html';
        return false;
    },

    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
};
