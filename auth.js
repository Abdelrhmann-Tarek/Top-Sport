// Authentication JavaScript
// Handles login/register form validation and user management

class AuthManager {
    constructor() {
        this.initAuthForms();
        this.initTabSwitching();
    }

    // Initialize authentication forms
    initAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    // Initialize tab switching functionality
    initTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const authForms = document.querySelectorAll('.auth-form');
        const linkButtons = document.querySelectorAll('.link-btn');

        // Tab button clicks
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Link button clicks (switch between forms)
        linkButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Keyboard navigation for tabs
        tabButtons.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = e.key === 'ArrowLeft' ? 
                        (index - 1 + tabButtons.length) % tabButtons.length :
                        (index + 1) % tabButtons.length;
                    tabButtons[nextIndex].click();
                    tabButtons[nextIndex].focus();
                }
            });
        });
    }

    // Switch between login and register tabs
    switchTab(tabName) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const authForms = document.querySelectorAll('.auth-form');

        // Update tab buttons
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        });

        // Update forms
        authForms.forEach(form => {
            if (form.id === `${tabName}Form`) {
                form.classList.add('active');
                // Focus first input when switching tabs
                const firstInput = form.querySelector('input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            } else {
                form.classList.remove('active');
            }
        });

        // Clear any existing error messages
        this.clearAllErrors();
    }

    // Setup real-time validation
    setupRealTimeValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('blur', () => this.validatePassword(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        // Confirm password validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPassword());
            confirmPasswordInput.addEventListener('input', () => this.clearError(confirmPasswordInput));
        }

        // Name validation
        const nameInput = document.getElementById('registerName');
        if (nameInput) {
            nameInput.addEventListener('blur', () => this.validateName(nameInput));
            nameInput.addEventListener('input', () => this.clearError(nameInput));
        }
    }

    // Handle login form submission
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        let isValid = true;

        // Validate email
        if (!this.validateEmail(document.getElementById('loginEmail'))) {
            isValid = false;
        }

        // Validate password
        if (!this.validatePassword(document.getElementById('loginPassword'))) {
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Mock login - check against stored users
        const storedUsers = JSON.parse(localStorage.getItem('topSportUsers') || '[]');
        const user = storedUsers.find(u => u.email === email && u.password === password);

        if (user) {
            // Successful login
            localStorage.setItem('topSportUser', JSON.stringify({
                name: user.name,
                email: user.email,
                loginTime: new Date().toISOString()
            }));
            
            Utils.showNotification('Login successful!', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Failed login
            this.showError('loginPassword', 'Invalid email or password');
        }
    }

    // Handle register form submission
    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        let isValid = true;

        // Validate all fields
        if (!this.validateName(document.getElementById('registerName'))) {
            isValid = false;
        }

        if (!this.validateEmail(document.getElementById('registerEmail'))) {
            isValid = false;
        }

        if (!this.validatePassword(document.getElementById('registerPassword'))) {
            isValid = false;
        }

        if (!this.validateConfirmPassword()) {
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Check if user already exists
        const storedUsers = JSON.parse(localStorage.getItem('topSportUsers') || '[]');
        if (storedUsers.find(u => u.email === email)) {
            this.showError('registerEmail', 'An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password, // In real app, this would be hashed
            registrationDate: new Date().toISOString()
        };

        storedUsers.push(newUser);
        localStorage.setItem('topSportUsers', JSON.stringify(storedUsers));

        // Auto-login the new user
        localStorage.setItem('topSportUser', JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            loginTime: new Date().toISOString()
        }));

        Utils.showNotification('Account created successfully!', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Validation methods
    validateEmail(input) {
        const email = input.value.trim();
        const errorElement = document.getElementById(input.id + 'Error');
        
        if (!email) {
            this.showError(input.id, 'Email is required');
            return false;
        }
        
        if (!Utils.validateEmail(email)) {
            this.showError(input.id, 'Please enter a valid email address');
            return false;
        }
        
        this.clearError(input);
        return true;
    }

    validatePassword(input) {
        const password = input.value;
        const errorElement = document.getElementById(input.id + 'Error');
        
        if (!password) {
            this.showError(input.id, 'Password is required');
            return false;
        }
        
        if (password.length < 8) {
            this.showError(input.id, 'Password must be at least 8 characters long');
            return false;
        }
        
        this.clearError(input);
        return true;
    }

    validateConfirmPassword() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!confirmPassword) {
            this.showError('confirmPassword', 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            return false;
        }
        
        this.clearError(document.getElementById('confirmPassword'));
        return true;
    }

    validateName(input) {
        const name = input.value.trim();
        
        if (!name) {
            this.showError(input.id, 'Name is required');
            return false;
        }
        
        if (name.length < 2) {
            this.showError(input.id, 'Name must be at least 2 characters long');
            return false;
        }
        
        this.clearError(input);
        return true;
    }

    // Error handling methods
    showError(inputId, message) {
        const errorElement = document.getElementById(inputId + 'Error');
        const inputElement = document.getElementById(inputId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('aria-live', 'polite');
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
            inputElement.setAttribute('aria-invalid', 'true');
        }
    }

    clearError(input) {
        const errorElement = document.getElementById(input.id + 'Error');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
    }

    clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('input.error');
        
        errorElements.forEach(el => el.textContent = '');
        inputElements.forEach(el => {
            el.classList.remove('error');
            el.setAttribute('aria-invalid', 'false');
        });
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    console.log('Authentication system initialized');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
