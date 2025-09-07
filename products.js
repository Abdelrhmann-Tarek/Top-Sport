// Products Display and Management JavaScript

class ProductsManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.displayProducts();
    }

    // Load products from JSON
    async loadProducts() {
        try {
            const response = await fetch('products.json');
            this.products = await response.json();
            this.filteredProducts = this.products;
            
            // Update cart manager with products
            if (window.cartManager) {
                await window.cartManager.loadProductData();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please try again later.');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterProducts(filter);
                this.updateActiveFilter(e.target);
            });
        });
    }

    // Filter products by category
    filterProducts(category) {
        this.currentFilter = category;
        
        if (category === 'all') {
            this.filteredProducts = this.products;
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === category
            );
        }
        
        this.displayProducts();
    }

    // Update active filter button
    updateActiveFilter(activeButton) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // Display products in grid
    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-12 text-center">
                    <p class="no-products">No products found in this category.</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.filteredProducts.map(product => `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        ${!product.inStock ? '<div class="out-of-stock-badge">Out of Stock</div>' : ''}
                        ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
                    </div>
                    
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        
                        <div class="product-actions">
                            <button class="btn btn-primary add-to-cart-btn" 
                                    data-product-id="${product.id}"
                                    ${!product.inStock ? 'disabled' : ''}>
                                ${!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button class="btn btn-outline-secondary view-details-btn" 
                                    data-product-id="${product.id}">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        productsGrid.innerHTML = productsHTML;
        this.setupProductEventListeners();
    }

    // Setup event listeners for product cards
    setupProductEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-product-id'));
                this.addToCart(productId);
            });
        });

        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                this.viewProductDetails(productId);
            });
        });

        // Product card click (also goes to details)
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.classList.contains('btn')) return;
                
                const productId = card.getAttribute('data-product-id');
                this.viewProductDetails(productId);
            });
        });
    }

    // Add product to cart
    addToCart(productId) {
        if (window.cartManager) {
            window.cartManager.addToCart(productId, 1);
            this.showNotification('Product added to cart!', 'success');
            
            // Add visual feedback
            const button = document.querySelector(`[data-product-id="${productId}"].add-to-cart-btn`);
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.classList.add('btn-success');
                button.classList.remove('btn-primary');
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-primary');
                }, 1500);
            }
        }
    }

    // View product details
    viewProductDetails(productId) {
        window.location.href = `product-details.html?id=${productId}`;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Show error message
    showError(message) {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="col-12 text-center">
                    <div class="error-message">
                        <h4>Error</h4>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                    </div>
                </div>
            `;
        }
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }
}

// Initialize products manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with products
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        window.productsManager = new ProductsManager();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsManager;
}
