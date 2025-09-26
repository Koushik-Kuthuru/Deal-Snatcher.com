// Product data will be loaded from JSON file
let products = [];

let currentProducts = [...products];
let displayedCount = 8;

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const navSearchInput = document.getElementById('navSearchInput');
const mobileNavSearchInput = document.getElementById('mobileNavSearchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        products = data.products;
        currentProducts = [...products];
        return true;
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to empty array if JSON loading fails
        products = [];
        currentProducts = [];
        return false;
    }
}

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        themeIcon.className = 'fas fa-sun';
        themeToggle.checked = true;
        updateToggleSwitch(true);
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.className = 'fas fa-moon';
        themeToggle.checked = false;
        updateToggleSwitch(false);
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
        document.documentElement.classList.remove('dark');
        themeIcon.className = 'fas fa-moon';
        themeToggle.checked = false;
        updateToggleSwitch(false);
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.className = 'fas fa-sun';
        themeToggle.checked = true;
        updateToggleSwitch(true);
        localStorage.setItem('theme', 'dark');
    }
}

function updateToggleSwitch(isDark) {
    const toggleTrack = themeToggle.nextElementSibling.querySelector('.relative > div:first-child');
    const toggleThumb = themeToggle.nextElementSibling.querySelector('.relative > div:last-child');

    if (isDark) {
        toggleTrack.className = 'w-12 h-6 bg-blue-600 rounded-full shadow-inner transition-colors duration-300 ease-in-out';
        toggleThumb.className = 'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform translate-x-6';
    } else {
        toggleTrack.className = 'w-12 h-6 bg-gray-600 rounded-full shadow-inner transition-colors duration-300 ease-in-out';
        toggleThumb.className = 'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform translate-x-0';
    }
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    // Initialize theme
    initTheme();

    // Show loading animation
    showLoading();

    // Load products from JSON
    const loaded = await loadProducts();

    if (loaded && products.length > 0) {
        displayProducts(currentProducts.slice(0, displayedCount));
        updateLoadMoreButton();

        // Handle URL parameters
        handleURLParameters();
    } else {
        // Show error message if products couldn't be loaded
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-500 text-xl mb-4">
                        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                        <p>Unable to load products</p>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400">Please check if products.json file exists and is accessible.</p>
                    <button onclick="location.reload()" class="mt-4 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    setupEventListeners();
});

// Handle URL parameters
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');

    if (searchParam && searchInput) {
        searchInput.value = searchParam;
        handleSearch();
    }

    if (categoryParam) {
        const categoryButton = Array.from(filterButtons).find(btn => btn.dataset.category === categoryParam);
        if (categoryButton) {
            handleFilter(categoryButton);
        }
    }
}

// Display products in the grid
function displayProducts(productsToShow) {
    productsGrid.innerHTML = '';

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer';
    card.onclick = () => openProductModal(product);

    const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    card.innerHTML = `
        <div class="relative">
            <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover">
            <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                -${discountPercentage}%
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-lg mb-2 line-clamp-2">${product.title}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
            <div class="flex items-center mb-3">
                <div class="flex text-yellow-400">
                    ${generateStars(product.rating)}
                </div>
                <span class="text-gray-500 text-sm ml-2">(${product.reviews})</span>
            </div>
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-xl font-bold text-primary">₹${formatNumber(product.price)}</span>
                    <span class="text-gray-500 line-through ml-2">₹${formatNumber(product.originalPrice)}</span>
                </div>
                <button class="bg-accent text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Navigation search functionality
    if (navSearchInput) {
        navSearchInput.addEventListener('input', handleNavSearch);
        navSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNavSearch();
            }
        });
    }

    if (mobileNavSearchInput) {
        mobileNavSearchInput.addEventListener('input', handleNavSearch);
        mobileNavSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNavSearch();
            }
        });
    }

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => handleFilter(button));
    });

    // Category links (navigation dropdown)
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleCategoryFilter(link);
        });
    });

    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }

    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Modal functionality
    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );

    currentProducts = filteredProducts;
    displayedCount = 8;
    displayProducts(currentProducts.slice(0, displayedCount));
    updateLoadMoreButton();
}

// Handle navigation search
function handleNavSearch() {
    const searchTerm = (navSearchInput?.value || mobileNavSearchInput?.value || '').toLowerCase();

    if (searchTerm.trim() === '') {
        return;
    }

    // Redirect to home page with search parameter
    const currentPage = window.location.pathname;
    if (currentPage !== '/index.html' && currentPage !== '/') {
        window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
    } else {
        // If already on home page, trigger search
        if (searchInput) {
            searchInput.value = searchTerm;
            handleSearch();
        }
    }
}

// Handle filter
function handleFilter(button) {
    // Update active button
    filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-primary-500', 'text-white');
        // Reset to default colorful styles based on category
        const category = btn.dataset.category;
        if (category === 'gadgets') {
            btn.className = 'filter-btn bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400 px-4 py-2 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-800 border border-secondary-200 dark:border-secondary-700';
        } else if (category === 'home') {
            btn.className = 'filter-btn bg-accent-100 dark:bg-accent-900 text-accent-600 dark:text-accent-400 px-4 py-2 rounded-full hover:bg-accent-200 dark:hover:bg-accent-800 border border-accent-200 dark:border-accent-700';
        } else if (category === 'tech') {
            btn.className = 'filter-btn bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400 px-4 py-2 rounded-full hover:bg-success-200 dark:hover:bg-success-800 border border-success-200 dark:border-success-700';
        } else if (category === 'outdoor') {
            btn.className = 'filter-btn bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 border border-primary-200 dark:border-primary-700';
        }
    });

    button.classList.add('active', 'bg-primary-500', 'text-white');
    button.classList.remove('bg-secondary-100', 'dark:bg-secondary-900', 'text-secondary-600', 'dark:text-secondary-400', 'bg-accent-100', 'dark:bg-accent-900', 'text-accent-600', 'dark:text-accent-400', 'bg-success-100', 'dark:bg-success-900', 'text-success-600', 'dark:text-success-400', 'bg-primary-100', 'dark:bg-primary-900', 'text-primary-600', 'dark:text-primary-400', 'border', 'border-secondary-200', 'dark:border-secondary-700', 'border-accent-200', 'dark:border-accent-700', 'border-success-200', 'dark:border-success-700', 'border-primary-200', 'dark:border-primary-700');

    const category = button.dataset.category;

    if (category === 'all') {
        currentProducts = [...products];
    } else {
        currentProducts = products.filter(product => product.category === category);
    }

    displayedCount = 8;
    displayProducts(currentProducts.slice(0, displayedCount));
    updateLoadMoreButton();
}

// Handle category filter from navigation dropdown
function handleCategoryFilter(link) {
    const category = link.dataset.category;

    // Update active category link
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(catLink => {
        catLink.classList.remove('bg-primary-500', 'text-white');
        catLink.classList.add('text-gray-700', 'dark:text-gray-300');
    });

    link.classList.add('bg-primary-500', 'text-white');
    link.classList.remove('text-gray-700', 'dark:text-gray-300');

    // Update filter buttons to match
    filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-primary-500', 'text-white');
        // Reset to default colorful styles based on category
        const btnCategory = btn.dataset.category;
        if (btnCategory === 'gadgets') {
            btn.className = 'filter-btn bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400 px-4 py-2 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-800 border border-secondary-200 dark:border-secondary-700';
        } else if (btnCategory === 'home') {
            btn.className = 'filter-btn bg-accent-100 dark:bg-accent-900 text-accent-600 dark:text-accent-400 px-4 py-2 rounded-full hover:bg-accent-200 dark:hover:bg-accent-800 border border-accent-200 dark:border-accent-700';
        } else if (btnCategory === 'tech') {
            btn.className = 'filter-btn bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400 px-4 py-2 rounded-full hover:bg-success-200 dark:hover:bg-success-800 border border-success-200 dark:border-success-700';
        } else if (btnCategory === 'outdoor') {
            btn.className = 'filter-btn bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 border border-primary-200 dark:border-primary-700';
        }
    });

    // Activate corresponding filter button
    const correspondingButton = Array.from(filterButtons).find(btn => btn.dataset.category === category);
    if (correspondingButton) {
        correspondingButton.classList.add('active', 'bg-primary-500', 'text-white');
    }

    // Filter products
    if (category === 'all') {
        currentProducts = [...products];
    } else {
        currentProducts = products.filter(product => product.category === category);
    }

    // Clear search input
    searchInput.value = '';

    displayedCount = 8;
    displayProducts(currentProducts.slice(0, displayedCount));
    updateLoadMoreButton();

    // Close mobile menu if open
    mobileMenu.classList.add('hidden');
}

// Handle sort
function handleSort() {
    const sortValue = sortSelect.value;

    switch (sortValue) {
        case 'newest':
            currentProducts.sort((a, b) => b.id - a.id);
            break;
        case 'popular':
            currentProducts.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'price-low':
            currentProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            currentProducts.sort((a, b) => b.price - a.price);
            break;
    }

    displayedCount = 8;
    displayProducts(currentProducts.slice(0, displayedCount));
    updateLoadMoreButton();
}

// Load more products
function loadMoreProducts() {
    displayedCount += 4;
    displayProducts(currentProducts.slice(0, displayedCount));
    updateLoadMoreButton();
}

// Update load more button visibility
function updateLoadMoreButton() {
    if (displayedCount >= currentProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Open product modal
function openProductModal(product) {
    // Set main product info
    document.getElementById('modalMainImage').src = product.image;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = `₹${formatNumber(product.price)}`;
    document.getElementById('modalOriginalPrice').textContent = `₹${formatNumber(product.originalPrice)}`;
    document.getElementById('modalBrand').textContent = product.brand || 'Brand';

    // Set affiliate link
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (product.affiliateLink) {
        buyNowBtn.href = product.affiliateLink;
        buyNowBtn.target = '_blank';
        buyNowBtn.rel = 'noopener noreferrer';
        console.log('Affiliate link set:', product.affiliateLink);

        // Add click event listener to ensure it works
        buyNowBtn.onclick = function (e) {
            e.preventDefault();
            window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
        };
    } else {
        buyNowBtn.href = '#';
        console.log('No affiliate link found for product:', product.title);
    }

    // Handle multiple images
    const imageThumbnails = document.getElementById('imageThumbnails');
    imageThumbnails.innerHTML = '';

    if (product.images && product.images.length > 0) {
        product.images.forEach((imageUrl, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = imageUrl;
            thumbnail.alt = `${product.title} - Image ${index + 1}`;
            thumbnail.className = 'w-16 h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-primary transition-colors';
            thumbnail.onclick = () => {
                document.getElementById('modalMainImage').src = imageUrl;
                // Update active thumbnail
                imageThumbnails.querySelectorAll('img').forEach(img => img.classList.remove('border-primary'));
                thumbnail.classList.add('border-primary');
            };
            imageThumbnails.appendChild(thumbnail);
        });

        // Set first thumbnail as active
        if (imageThumbnails.firstChild) {
            imageThumbnails.firstChild.classList.add('border-primary');
        }
    }

    // Handle YouTube video
    const youtubeSection = document.getElementById('youtubeSection');
    const watchVideoBtn = document.getElementById('watchVideoBtn');
    const youtubeVideo = document.getElementById('youtubeVideo');

    if (product.youtubeVideo) {
        // Convert YouTube URL to embed format
        const videoId = extractYouTubeId(product.youtubeVideo);
        if (videoId) {
            youtubeVideo.src = `https://www.youtube.com/embed/${videoId}`;
            watchVideoBtn.classList.remove('hidden');
            watchVideoBtn.onclick = () => {
                // Open YouTube video in new tab with autoplay
                const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
                window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
            };
        }
    } else {
        youtubeSection.classList.add('hidden');
        watchVideoBtn.classList.add('hidden');
    }

    productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Close product modal
function closeProductModal() {
    // Hide video section and reset video
    const youtubeSection = document.getElementById('youtubeSection');
    const watchVideoBtn = document.getElementById('watchVideoBtn');
    const youtubeVideo = document.getElementById('youtubeVideo');

    youtubeSection.classList.add('hidden');
    watchVideoBtn.classList.remove('hidden');
    youtubeVideo.src = ''; // Stop video playback

    productModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Add smooth scrolling for anchor links
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

// Add loading animation
function showLoading() {
    productsGrid.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    `;
}

// Simulate loading delay for better UX
function simulateLoading(callback) {
    showLoading();
    setTimeout(callback, 500);
}

