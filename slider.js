// Hero Slider JavaScript
// Implements autoplay, pause on hover, navigation controls, and dots

class HeroSlider {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.warn('Slider container not found');
            return;
        }

        this.slides = [];
        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds
        this.isPlaying = true;
        this.isPaused = false;

        this.init();
    }

    // Initialize slider
    init() {
        this.createSliderStructure();
        this.setupEventListeners();
        this.startAutoplay();
        console.log('Hero slider initialized');
    }

    // Create slider HTML structure
    createSliderStructure() {
        // Slider data with actual images
        this.slidesData = [
            {
                image: 'images/slider2.jpeg',
                title: 'Premium Jerseys',
                subtitle: 'Professional quality jerseys for every sport',
                cta: 'Shop Jerseys',
                ctaLink: '#products'
            },
            {
                image: 'images/slider3.png',
                title: 'Sports Jerseys Collection',
                subtitle: 'Authentic team jerseys and custom designs',
                cta: 'Explore Collection',
                ctaLink: '#products'
            },
            {
                image: 'images/slider1.jpeg',
                title: 'Training Accessories',
                subtitle: 'Take your training to the next level',
                cta: 'Get Started',
                ctaLink: '#products'
            }
        ];

        // Create slider HTML
        this.container.innerHTML = `
            <div class="hero-slider" role="region" aria-label="Featured products carousel">
                <div class="slider-wrapper">
                    <div class="slides-container" id="slidesContainer">
                        ${this.slidesData.map((slide, index) => `
                            <div class="slide ${index === 0 ? 'active' : ''}" 
                                 style="background-image: linear-gradient(rgba(4, 29, 69, 0.7), rgba(163, 21, 33, 0.7)), url('${slide.image}')"
                                 role="tabpanel" 
                                 aria-label="Slide ${index + 1} of ${this.slidesData.length}">
                                <div class="slide-content">
                                    <h1 class="slide-title">${slide.title}</h1>
                                    <p class="slide-subtitle">${slide.subtitle}</p>
                                    <a href="${slide.ctaLink}" class="slide-cta btn btn-primary">${slide.cta}</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Navigation Controls -->
                    <button class="slider-control prev" 
                            aria-label="Previous slide" 
                            title="Previous slide">
                        <span class="control-icon">❮</span>
                    </button>
                    <button class="slider-control next" 
                            aria-label="Next slide" 
                            title="Next slide">
                        <span class="control-icon">❯</span>
                    </button>
                </div>
                
                <!-- Dots Navigation -->
                <div class="slider-dots" role="tablist" aria-label="Slide navigation">
                    ${this.slidesData.map((_, index) => `
                        <button class="dot ${index === 0 ? 'active' : ''}" 
                                data-slide="${index}"
                                role="tab"
                                aria-label="Go to slide ${index + 1}"
                                aria-selected="${index === 0 ? 'true' : 'false'}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Cache DOM elements
        this.slidesContainer = this.container.querySelector('#slidesContainer');
        this.slides = this.container.querySelectorAll('.slide');
        this.dots = this.container.querySelectorAll('.dot');
        this.prevBtn = this.container.querySelector('.prev');
        this.nextBtn = this.container.querySelector('.next');
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Dots navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });


        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.container.addEventListener('mouseleave', () => this.resumeAutoplay());

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Touch/swipe support for mobile
        this.setupTouchEvents();

        // Pause when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else if (this.isPlaying) {
                this.resumeAutoplay();
            }
        });
    }

    // Setup touch/swipe events for mobile
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        const threshold = 50; // Minimum swipe distance

        this.slidesContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.slidesContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextSlide(); // Swipe left - next slide
                } else {
                    this.previousSlide(); // Swipe right - previous slide
                }
            }
        }, { passive: true });
    }

    // Navigation methods
    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.slides.length);
    }

    previousSlide() {
        this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length);
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;

        // Update slides
        this.slides[this.currentSlide].classList.remove('active');
        this.slides[index].classList.add('active');

        // Update dots
        this.dots[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].setAttribute('aria-selected', 'false');
        this.dots[index].classList.add('active');
        this.dots[index].setAttribute('aria-selected', 'true');

        this.currentSlide = index;

        // Announce slide change for screen readers
        this.announceSlideChange();
    }

    // Autoplay methods
    startAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
        
        this.autoplayInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.autoplayDelay);
    }

    pauseAutoplay() {
        this.isPaused = true;
    }

    resumeAutoplay() {
        if (this.isPlaying) {
            this.isPaused = false;
        }
    }

    toggleAutoplay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.isPaused = false;
            this.playPauseBtn.querySelector('.playpause-icon').textContent = '⏸';
            this.playPauseBtn.setAttribute('aria-label', 'Pause slideshow');
            this.playPauseBtn.setAttribute('title', 'Pause slideshow');
        } else {
            this.isPaused = true;
            this.playPauseBtn.querySelector('.playpause-icon').textContent = '▶';
            this.playPauseBtn.setAttribute('aria-label', 'Play slideshow');
            this.playPauseBtn.setAttribute('title', 'Play slideshow');
        }
    }

    // Keyboard navigation
    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
            case 'Enter':
                if (e.target.classList.contains('slider-playpause')) {
                    e.preventDefault();
                    this.toggleAutoplay();
                }
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.slides.length - 1);
                break;
        }
    }

    // Accessibility
    announceSlideChange() {
        const announcement = `Slide ${this.currentSlide + 1} of ${this.slides.length}`;
        
        // Create or update live region for screen readers
        let liveRegion = document.getElementById('slider-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'slider-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = announcement;
    }

    // Destroy slider (cleanup)
    destroy() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
        
        const liveRegion = document.getElementById('slider-live-region');
        if (liveRegion) {
            liveRegion.remove();
        }
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with a hero section
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        window.heroSlider = new HeroSlider('#hero');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroSlider;
}
