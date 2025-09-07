// Main Application JavaScript
// Handles cart functionality, navigation, and common utilities

// Cart Management
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.products = this.getProductData(); // Will be populated with actual product data
        this.updateCartDisplay();
    }

    // Load cart from localStorage
    loadCart() {
        const saved = localStorage.getItem('topSportCart');
        return saved ? JSON.parse(saved) : {};
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('topSportCart', JSON.stringify(this.cart));
        this.updateCartDisplay();
    }

    // Add item to cart
    addToCart(productId, quantity = 1) {
        if (this.cart[productId]) {
            this.cart[productId] += quantity;
        } else {
            this.cart[productId] = quantity;
        }
        this.saveCart();
        console.log(`Added ${quantity} of product ${productId} to cart`);
    }

    // Remove item from cart
    removeFromCart(productId) {
        delete this.cart[productId];
        this.saveCart();
        console.log(`Removed product ${productId} from cart`);
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.cart[productId] = quantity;
            this.saveCart();
        }
    }

    // Get cart total (money)
    getCartTotal() {
        let total = 0;
        for (const [productId, quantity] of Object.entries(this.cart)) {
            const product = this.products[productId];
            if (product) {
                total += product.price * quantity;
            }
        }
        return total;
    }

    // Get cart item count
    getCartItemCount() {
        return Object.values(this.cart).reduce((sum, qty) => sum + qty, 0);
    }

    // Update cart display in navbar
    updateCartDisplay() {
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            const total = this.getCartTotal();
            cartTotalElement.textContent = `🛒 $${total.toFixed(2)}`;
        }
    }

    // Get product data (placeholder - will be populated with real products)
    getProductData() {
        return {
            // Example product structure:
            // 'product-1': { name: 'Basketball', price: 29.99, image: 'basketball.jpg' },
            // 'product-2': { name: 'Soccer Ball', price: 24.99, image: 'soccer.jpg' },
            // This will be populated when products are added to the site
        };
    }

    // Get cart contents for cart page
    getCartContents() {
        const contents = [];
        for (const [productId, quantity] of Object.entries(this.cart)) {
            const product = this.products[productId];
            if (product) {
                contents.push({
                    id: productId,
                    ...product,
                    quantity: quantity,
                    subtotal: product.price * quantity
                });
            }
        }
        return contents;
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.initNavigation();
        this.handleAuthState();
    }

    // Initialize navigation functionality
    initNavigation() {
        // Mobile menu toggle
        const navToggler = document.querySelector('.navbar-toggler');
        const navCollapse = document.querySelector('.navbar-collapse');
        
        if (navToggler && navCollapse) {
            navToggler.addEventListener('click', () => {
                const isExpanded = navToggler.getAttribute('aria-expanded') === 'true';
                navToggler.setAttribute('aria-expanded', !isExpanded);
                navCollapse.classList.toggle('show');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggler.contains(e.target) && !navCollapse.contains(e.target)) {
                    navCollapse.classList.remove('show');
                    navToggler.setAttribute('aria-expanded', 'false');
                }
            });

            // Close mobile menu when pressing Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navCollapse.classList.contains('show')) {
                    navCollapse.classList.remove('show');
                    navToggler.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Handle authentication state
    handleAuthState() {
        const currentUser = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (currentUser && loginBtn && registerBtn) {
            // User is logged in - show user info instead of login/register
            loginBtn.textContent = `Hi, ${currentUser.name}`;
            loginBtn.href = '#';
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserMenu();
            });
            registerBtn.style.display = 'none';
        }
    }

    // Get current user from localStorage
    getCurrentUser() {
        const user = localStorage.getItem('topSportUser');
        return user ? JSON.parse(user) : null;
    }

    // Show user menu (placeholder)
    showUserMenu() {
        // This will be expanded to show user profile options, logout, etc.
        if (confirm('Do you want to logout?')) {
            localStorage.removeItem('topSportUser');
            window.location.reload();
        }
    }
}

// Utility Functions
const Utils = {
    // Format currency
    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Show notification (placeholder for future toast notifications)
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // This can be expanded to show actual toast notifications
    },

    // Debounce function for search/input handling
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart manager
    window.cartManager = new CartManager();
    
    // Initialize navigation
    window.navigationManager = new NavigationManager();
    
    // Make utilities globally available
    window.Utils = Utils;
    
    console.log('TopSport application initialized');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CartManager, NavigationManager, Utils };
}
