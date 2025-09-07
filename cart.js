// Cart Page JavaScript
// Handles cart display, item management, and checkout

class CartPageManager {
    constructor() {
        this.products = {};
        this.cart = {};
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.loadCart();
        this.displayCartItems();
        this.setupEventListeners();
    }

    // Load products from JSON
    async loadProducts() {
        try {
            const response = await fetch('products.json');
            const productsArray = await response.json();
            
            // Convert to object for easier lookup
            productsArray.forEach(product => {
                this.products[product.id] = product;
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Load cart from localStorage
    loadCart() {
        const saved = localStorage.getItem('topSportCart');
        this.cart = saved ? JSON.parse(saved) : {};
    }

    // Display cart items
    displayCartItems() {
        const cartContainer = document.getElementById('cartItemsContainer');
        const emptyMessage = document.getElementById('emptyCartMessage');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartContainer) return;

        const cartItems = this.getCartItems();

        if (cartItems.length === 0) {
            cartContainer.innerHTML = '';
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            this.updateCartSummary(0, 0, 0, 0);
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = false;

        const cartHTML = cartItems.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid">
                </div>
                
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-description">${item.description}</p>
                    <div class="cart-item-meta">
                        <span class="cart-item-category">${this.formatCategory(item.category)}</span>
                        <span class="cart-item-sport">${this.formatSport(item.sport)}</span>
                    </div>
                </div>
                
                <div class="cart-item-price">
                    <div class="item-unit-price">$${item.price.toFixed(2)} each</div>
                </div>
                
                <div class="cart-item-quantity">
                    <div class="quantity-controls-cart">
                        <button class="quantity-btn-cart minus" data-product-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn-cart plus" data-product-id="${item.id}">+</button>
                    </div>
                </div>
                
                <div class="cart-item-total">
                    <div class="item-total-price">$${item.subtotal.toFixed(2)}</div>
                </div>
                
                <div class="cart-item-actions">
                    <button class="btn btn-sm btn-outline-danger remove-item-btn" data-product-id="${item.id}">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        cartContainer.innerHTML = `
            <div class="cart-items-header">
                <div class="header-image">Product</div>
                <div class="header-details">Details</div>
                <div class="header-price">Price</div>
                <div class="header-quantity">Quantity</div>
                <div class="header-total">Total</div>
                <div class="header-actions">Actions</div>
            </div>
            ${cartHTML}
        `;

        this.setupCartEventListeners();
        this.updateCartSummary();
    }

    // Get cart items with product details
    getCartItems() {
        const items = [];
        for (const [productId, quantity] of Object.entries(this.cart)) {
            const product = this.products[productId];
            if (product) {
                items.push({
                    id: productId,
                    ...product,
                    quantity: quantity,
                    subtotal: product.price * quantity
                });
            }
        }
        return items;
    }

    // Setup cart-specific event listeners
    setupCartEventListeners() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                const isPlus = e.target.classList.contains('plus');
                this.updateQuantity(productId, isPlus);
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                this.removeItem(productId);
            });
        });
    }

    // Update item quantity
    updateQuantity(productId, increase) {
        const currentQuantity = this.cart[productId] || 0;
        let newQuantity = increase ? currentQuantity + 1 : currentQuantity - 1;

        if (newQuantity <= 0) {
            this.removeItem(productId);
        } else if (newQuantity <= 10) { // Max quantity limit
            this.cart[productId] = newQuantity;
            this.saveCart();
            this.displayCartItems();
            this.updateNavbarCart();
        }
    }

    // Remove item from cart
    removeItem(productId) {
        const product = this.products[productId];
        if (product) {
            delete this.cart[productId];
            this.saveCart();
            this.displayCartItems();
            this.updateNavbarCart();
            this.showNotification(`${product.name} removed from cart`, 'info');
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('topSportCart', JSON.stringify(this.cart));
    }

    // Update navbar cart display
    updateNavbarCart() {
        if (window.cartManager) {
            window.cartManager.cart = this.cart;
            window.cartManager.updateCartDisplay();
        }
    }

    // Update cart summary
    updateCartSummary() {
        const cartItems = this.getCartItems();
        const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
        const shipping = subtotal > 100 ? 0 : (subtotal > 0 ? 9.99 : 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        // Update summary elements
        const subtotalEl = document.getElementById('cartSubtotal');
        const shippingEl = document.getElementById('cartShipping');
        const taxEl = document.getElementById('cartTax');
        const totalEl = document.getElementById('cartGrandTotal');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
        }
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

        // Show free shipping message
        this.updateShippingMessage(subtotal);
    }

    // Update shipping message
    updateShippingMessage(subtotal) {
        let shippingMessage = document.getElementById('shippingMessage');
        
        if (!shippingMessage) {
            shippingMessage = document.createElement('div');
            shippingMessage.id = 'shippingMessage';
            shippingMessage.className = 'shipping-message';
            
            const summaryEl = document.querySelector('.cart-summary');
            if (summaryEl) {
                summaryEl.insertBefore(shippingMessage, summaryEl.querySelector('.summary-row'));
            }
        }

        if (subtotal > 0 && subtotal < 100) {
            const remaining = 100 - subtotal;
            shippingMessage.innerHTML = `
                <div class="shipping-notice">
                    <i>🚚</i> Add $${remaining.toFixed(2)} more for free shipping!
                </div>
            `;
            shippingMessage.style.display = 'block';
        } else if (subtotal >= 100) {
            shippingMessage.innerHTML = `
                <div class="shipping-notice free">
                    <i>✅</i> You qualify for free shipping!
                </div>
            `;
            shippingMessage.style.display = 'block';
        } else {
            shippingMessage.style.display = 'none';
        }
    }

    // Setup main event listeners
    setupEventListeners() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Continue shopping button
        const continueBtn = document.querySelector('.empty-cart .btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = 'index.html#products';
            });
        }
    }

    // Handle checkout process
    handleCheckout() {
        const cartItems = this.getCartItems();
        if (cartItems.length === 0) return;

        // Check if user is logged in
        const currentUser = localStorage.getItem('topSportUser');
        if (!currentUser) {
            this.showCheckoutModal('Please login to complete your order', 'login');
            return;
        }

        // Show checkout confirmation
        this.showCheckoutModal('confirm');
    }

    // Show checkout modal
    showCheckoutModal(type, action = null) {
        // Remove existing modal
        const existingModal = document.getElementById('checkoutModal');
        if (existingModal) existingModal.remove();

        let modalContent = '';
        
        if (type === 'Please login to complete your order') {
            modalContent = `
                <div class="modal-content">
                    <h3>Login Required</h3>
                    <p>${type}</p>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="window.location.href='auth.html'">Login</button>
                        <button class="btn btn-secondary" onclick="this.closest('.checkout-modal').remove()">Cancel</button>
                    </div>
                </div>
            `;
        } else {
            const cartItems = this.getCartItems();
            const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
            const shipping = subtotal > 100 ? 0 : 9.99;
            const tax = subtotal * 0.08;
            const total = subtotal + shipping + tax;

            modalContent = `
                <div class="modal-content">
                    <h3>Confirm Your Order</h3>
                    <div class="order-summary">
                        <h4>Order Summary</h4>
                        ${cartItems.map(item => `
                            <div class="order-item">
                                <span>${item.name} x${item.quantity}</span>
                                <span>$${item.subtotal.toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <hr>
                        <div class="order-totals">
                            <div class="order-row">
                                <span>Subtotal:</span>
                                <span>$${subtotal.toFixed(2)}</span>
                            </div>
                            <div class="order-row">
                                <span>Shipping:</span>
                                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
                            </div>
                            <div class="order-row">
                                <span>Tax:</span>
                                <span>$${tax.toFixed(2)}</span>
                            </div>
                            <div class="order-row total">
                                <span>Total:</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-success" onclick="window.cartPageManager.completeOrder()">Complete Order</button>
                        <button class="btn btn-secondary" onclick="this.closest('.checkout-modal').remove()">Cancel</button>
                    </div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.className = 'checkout-modal';
        modal.innerHTML = modalContent;

        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Complete the order
    completeOrder() {
        const cartItems = this.getCartItems();
        const orderNumber = this.generateOrderNumber();
        
        // Save order to localStorage (in real app, this would go to server)
        const order = {
            orderNumber: orderNumber,
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
            date: new Date().toISOString(),
            status: 'confirmed'
        };
        
        const orders = JSON.parse(localStorage.getItem('topSportOrders') || '[]');
        orders.push(order);
        localStorage.setItem('topSportOrders', JSON.stringify(orders));

        // Clear cart
        this.cart = {};
        this.saveCart();
        this.updateNavbarCart();

        // Close modal
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.remove();

        // Show success message
        this.showOrderSuccess(orderNumber);
    }

    // Generate order number
    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TS${timestamp}${random}`;
    }

    // Show order success message
    showOrderSuccess(orderNumber) {
        const successModal = document.createElement('div');
        successModal.className = 'checkout-modal success-modal';
        successModal.innerHTML = `
            <div class="modal-content success-content">
                <div class="success-icon">✅</div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order. Your order has been successfully placed.</p>
                <div class="order-details">
                    <h4>Order Details</h4>
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Status:</strong> Confirmed</p>
                    <p>You will receive an email confirmation shortly.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">Continue Shopping</button>
                    <button class="btn btn-secondary" onclick="this.closest('.checkout-modal').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(successModal);

        // Refresh cart display
        this.displayCartItems();
    }

    // Format category
    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Format sport
    formatSport(sport) {
        return sport.charAt(0).toUpperCase() + sport.slice(1);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartPageManager = new CartPageManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartPageManager;
}
