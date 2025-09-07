// Product Details Page JavaScript

class ProductDetailsManager {
    constructor() {
        this.product = null;
        this.relatedProducts = [];
        this.quantity = 1;
        this.init();
    }

    async init() {
        const productId = this.getProductIdFromURL();
        if (!productId) {
            this.showError('Product not found');
            return;
        }

        await this.loadProduct(productId);
        this.displayProductDetails();
        this.loadRelatedProducts();
        this.setupEventListeners();
    }

    // Get product ID from URL parameters
    getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Load product data
    async loadProduct(productId) {
        try {
            const response = await fetch('products.json');
            const products = await response.json();
            this.product = products.find(p => p.id === parseInt(productId));
            
            if (!this.product) {
                throw new Error('Product not found');
            }

            // Update page title and breadcrumb
            document.title = `${this.product.name} - TopSport`;
            const breadcrumb = document.getElementById('productBreadcrumb');
            if (breadcrumb) {
                breadcrumb.textContent = this.product.name;
            }

        } catch (error) {
            console.error('Error loading product:', error);
            this.showError('Failed to load product details');
        }
    }

    // Display product details
    displayProductDetails() {
        if (!this.product) return;

        const container = document.getElementById('productDetailsContent');
        if (!container) return;

        const detailsHTML = `
            <div class="col-lg-6 col-md-12">
                <div class="product-image-large">
                    <img src="${this.product.image}" alt="${this.product.name}" class="img-fluid">
                    ${!this.product.inStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
                </div>
            </div>
            
            <div class="col-lg-6 col-md-12">
                <div class="product-details-info">
                    <h1 class="product-title">${this.product.name}</h1>
                    
                    <div class="product-meta">
                        <span class="product-category">${this.formatCategory(this.product.category)}</span>
                        <span class="product-sport">${this.formatSport(this.product.sport)}</span>
                        ${this.product.featured ? '<span class="featured-tag">Featured</span>' : ''}
                    </div>
                    
                    <div class="product-price-large">$${this.product.price.toFixed(2)}</div>
                    
                    <div class="product-description-full">
                        <p>${this.product.description}</p>
                    </div>
                    
                    <div class="product-stock-status">
                        ${this.product.inStock ? 
                            '<span class="in-stock"><i class="✓"></i> In Stock</span>' : 
                            '<span class="out-of-stock"><i class="✗"></i> Out of Stock</span>'
                        }
                    </div>
                    
                    <div class="product-actions-detailed">
                        <div class="quantity-selector">
                            <label for="quantity">Quantity:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" ${!this.product.inStock ? 'disabled' : ''}>-</button>
                                <input type="number" id="quantity" value="1" min="1" max="10" ${!this.product.inStock ? 'disabled' : ''}>
                                <button class="quantity-btn plus" ${!this.product.inStock ? 'disabled' : ''}>+</button>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary btn-lg add-to-cart-detailed" 
                                ${!this.product.inStock ? 'disabled' : ''}>
                            ${!this.product.inStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        
                        <button class="btn btn-outline-secondary btn-lg" onclick="history.back()">
                            Back to Products
                        </button>
                    </div>
                    
                    <div class="product-specifications">
                        <h4>Product Details</h4>
                        <ul>
                            <li><strong>Category:</strong> ${this.formatCategory(this.product.category)}</li>
                            <li><strong>Sport:</strong> ${this.formatSport(this.product.sport)}</li>
                            <li><strong>Product ID:</strong> #${this.product.id.toString().padStart(3, '0')}</li>
                            <li><strong>Availability:</strong> ${this.product.inStock ? 'In Stock' : 'Out of Stock'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = detailsHTML;
    }

    // Load related products
    async loadRelatedProducts() {
        try {
            const response = await fetch('products.json');
            const allProducts = await response.json();
            
            // Get products from same category or sport, excluding current product
            this.relatedProducts = allProducts
                .filter(p => 
                    p.id !== this.product.id && 
                    (p.category === this.product.category || p.sport === this.product.sport)
                )
                .slice(0, 3); // Show max 3 related products

            this.displayRelatedProducts();
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    // Display related products
    displayRelatedProducts() {
        const container = document.getElementById('relatedProductsGrid');
        if (!container || this.relatedProducts.length === 0) {
            if (container) {
                container.innerHTML = '<div class="col-12"><p>No related products found.</p></div>';
            }
            return;
        }

        const relatedHTML = this.relatedProducts.map(product => `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div class="product-card related-product" data-product-id="${product.id}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        ${!product.inStock ? '<div class="out-of-stock-badge">Out of Stock</div>' : ''}
                    </div>
                    
                    <div class="product-info">
                        <h4 class="product-name">${product.name}</h4>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        
                        <div class="product-actions">
                            <button class="btn btn-sm btn-primary" onclick="window.location.href='product-details.html?id=${product.id}'">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = relatedHTML;
    }

    // Setup event listeners
    setupEventListeners() {
        // Quantity controls
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const quantityInput = document.getElementById('quantity');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                    this.quantity = currentValue - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue < 10) {
                    quantityInput.value = currentValue + 1;
                    this.quantity = currentValue + 1;
                }
            });

            quantityInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value);
                if (value < 1) value = 1;
                if (value > 10) value = 10;
                e.target.value = value;
                this.quantity = value;
            });
        }

        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-detailed');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
    }

    // Add product to cart
    addToCart() {
        if (!this.product.inStock) return;

        if (window.cartManager) {
            window.cartManager.addToCart(this.product.id, this.quantity);
            this.showNotification(`Added ${this.quantity} ${this.product.name}(s) to cart!`, 'success');
            
            // Visual feedback
            const button = document.querySelector('.add-to-cart-detailed');
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Added to Cart!';
                button.classList.add('btn-success');
                button.classList.remove('btn-primary');
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-primary');
                }, 2000);
            }
        }
    }

    // Format category for display
    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Format sport for display
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

    // Show error
    showError(message) {
        const container = document.getElementById('productDetailsContent');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="error-message">
                        <h2>Error</h2>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="window.location.href='index.html'">
                            Back to Home
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productDetailsManager = new ProductDetailsManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDetailsManager;
}
