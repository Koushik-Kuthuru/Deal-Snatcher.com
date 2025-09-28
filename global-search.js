// Global Search Functionality for Deal-Snatcher
class GlobalSearch {
    constructor() {
        this.searchData = null;
        this.init();
    }

    async init() {
        await this.loadSearchData();
        this.setupSearchListeners();
        this.addSuggestionsCSS();
    }

    addSuggestionsCSS() {
        // Add CSS for suggestions dropdown if not already added
        if (document.getElementById('search-suggestions-css')) return;

        const style = document.createElement('style');
        style.id = 'search-suggestions-css';
        style.textContent = `
            .search-suggestions {
                animation: slideDown 0.2s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .suggestion-item {
                transition: background-color 0.2s ease;
            }
            
            .suggestion-item:hover {
                background-color: #f3f4f6 !important;
            }
            
            .dark .suggestion-item:hover {
                background-color: #374151 !important;
            }
            
            .search-suggestions::-webkit-scrollbar {
                width: 6px;
            }
            
            .search-suggestions::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            
            .search-suggestions::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }
            
            .search-suggestions::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            
            .dark .search-suggestions::-webkit-scrollbar-track {
                background: #374151;
            }
            
            .dark .search-suggestions::-webkit-scrollbar-thumb {
                background: #6b7280;
            }
            
            .dark .search-suggestions::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }
        `;
        document.head.appendChild(style);
    }

    async loadSearchData() {
        try {
            console.log('Loading search data...');
            // Load centralized search data
            const response = await fetch('search-data.json');
            this.searchData = await response.json();

            console.log('Search data loaded successfully:', this.searchData);
            console.log('Products count:', this.searchData.products?.length || 0);
            console.log('Gifts categories:', Object.keys(this.searchData.gifts || {}));
            console.log('Earn items count:', this.searchData.earn?.length || 0);
        } catch (error) {
            console.error('Error loading search data:', error);
        }
    }

    setupSearchListeners() {
        // Find navigation search inputs only (not main search section)
        const navSearchInputs = document.querySelectorAll('input[id*="navSearch"], input[id*="mobileNavSearch"]');

        navSearchInputs.forEach(input => {
            // Create suggestions dropdown
            this.createSuggestionsDropdown(input);

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(input.value);
                }
            });

            // Add live suggestions
            input.addEventListener('input', (e) => {
                this.showSuggestions(input, e.target.value);
            });

            // Hide suggestions when clicking outside
            input.addEventListener('blur', (e) => {
                setTimeout(() => {
                    this.hideSuggestions(input);
                }, 200);
            });

            // Add search button click handler if there's a search button nearby
            const searchButton = input.parentElement.querySelector('button, .search-btn');
            if (searchButton) {
                searchButton.addEventListener('click', () => {
                    this.performSearch(input.value);
                });
            }
        });
    }

    createSuggestionsDropdown(input) {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-suggestions absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 hidden';
        dropdown.style.maxHeight = '300px';
        dropdown.style.overflowY = 'auto';

        // Make input container relative positioned
        const container = input.parentElement;
        if (container.style.position !== 'absolute') {
            container.style.position = 'relative';
        }

        container.appendChild(dropdown);
        input.setAttribute('data-suggestions-dropdown', 'true');
    }

    showSuggestions(input, searchTerm) {
        if (!searchTerm.trim()) {
            this.hideSuggestions(input);
            return;
        }

        const suggestions = this.generateSuggestions(searchTerm);
        const dropdown = input.parentElement.querySelector('.search-suggestions');

        if (!dropdown) return;

        if (suggestions.length === 0) {
            this.hideSuggestions(input);
            return;
        }

        dropdown.innerHTML = '';

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0';

            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="${suggestion.icon} text-gray-400 dark:text-gray-500"></i>
                    <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-gray-100">${suggestion.title}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${suggestion.subtitle}</div>
                    </div>
                </div>
            `;

            item.addEventListener('click', () => {
                input.value = suggestion.title;
                this.performSearch(suggestion.title);
            });

            dropdown.appendChild(item);
        });

        dropdown.classList.remove('hidden');
    }

    hideSuggestions(input) {
        const dropdown = input.parentElement.querySelector('.search-suggestions');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    generateSuggestions(searchTerm) {
        if (!this.searchData || !searchTerm.trim()) return [];

        const term = searchTerm.toLowerCase();
        const suggestions = [];

        // Category suggestions from centralized data
        const categorySuggestions = Object.entries(this.searchData.categories).map(([key, category]) => ({
            title: category.title,
            subtitle: `Browse ${key}`,
            description: category.description,
            icon: category.icon,
            category: key,
            link: category.link
        }));

        categorySuggestions.forEach(suggestion => {
            if (suggestion.title.toLowerCase().includes(term) ||
                suggestion.subtitle.toLowerCase().includes(term) ||
                suggestion.description.toLowerCase().includes(term) ||
                this.findFuzzyMatches(term, suggestion.title) ||
                this.findFuzzyMatches(term, suggestion.subtitle) ||
                this.findFuzzyMatches(term, suggestion.description)) {
                suggestions.push(suggestion);
            }
        });

        // Product suggestions (limit to 3)
        if (this.searchData.products) {
            let productCount = 0;
            for (const product of this.searchData.products) {
                if (productCount >= 3) break;
                if (product.title.toLowerCase().includes(term) ||
                    this.findFuzzyMatches(term, product.title)) {
                    suggestions.push({
                        title: product.title,
                        subtitle: `Product - ₹${product.price}`,
                        description: product.description.substring(0, 100) + '...',
                        icon: 'fas fa-box',
                        category: 'product',
                        link: `index.html?item=${encodeURIComponent(product.title)}`
                    });
                    productCount++;
                }
            }
        }

        // Earn suggestions (limit to 3)
        if (this.searchData.earn) {
            let earnCount = 0;
            for (const item of this.searchData.earn) {
                if (earnCount >= 3) break;
                if (item.name.toLowerCase().includes(term) ||
                    this.findFuzzyMatches(term, item.name)) {
                    suggestions.push({
                        title: item.name,
                        subtitle: `Earn ${item.reward}`,
                        description: item.description.substring(0, 100) + '...',
                        icon: 'fas fa-coins',
                        category: 'earn',
                        link: `earn.html?item=${encodeURIComponent(item.name)}`
                    });
                    earnCount++;
                }
            }
        }

        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    performSearch(searchTerm) {
        if (!searchTerm.trim()) return;

        // Store search term in sessionStorage for results page
        sessionStorage.setItem('globalSearchTerm', searchTerm);

        // Always redirect to search results page
        window.location.href = 'search-results.html';
    }

    findExactMatch(searchTerm) {
        if (!this.searchData || !searchTerm.trim()) return null;

        const term = searchTerm.toLowerCase().trim();

        // Check for category/gift page searches first
        const categoryMatch = this.findCategoryMatch(term);
        if (categoryMatch) {
            return categoryMatch;
        }

        // Search products for exact matches
        if (this.searchData.products) {
            for (const product of this.searchData.products) {
                if (this.isExactMatch(product.title, term) ||
                    this.isExactMatch(product.description, term)) {
                    return {
                        type: 'product',
                        title: product.title,
                        link: `index.html?item=${encodeURIComponent(product.title)}`,
                        data: product
                    };
                }
            }
        }

        // Search gifts for exact matches
        Object.entries(this.searchData.gifts).forEach(([category, gifts]) => {
            for (const gift of gifts) {
                if (this.isExactMatch(gift.title, term) ||
                    this.isExactMatch(gift.description, term)) {
                    return {
                        type: 'gift',
                        title: gift.title,
                        link: `${category}.html?item=${encodeURIComponent(gift.title)}`,
                        data: gift
                    };
                }
            }
        });

        // Search earn opportunities for exact matches
        if (this.searchData.earn) {
            for (const item of this.searchData.earn) {
                if (this.isExactMatch(item.name, term) ||
                    this.isExactMatch(item.description, term)) {
                    return {
                        type: 'earn',
                        title: item.name,
                        link: `earn.html?item=${encodeURIComponent(item.name)}`,
                        data: item
                    };
                }
            }
        }

        return null;
    }

    findCategoryMatch(searchTerm) {
        const categoryKeywords = {
            'mom-gifts': [
                'mom', 'mother', 'mama', 'mummy', 'mommy', 'maternal',
                'best gift for mom', 'gifts for mom', 'mom gifts',
                'mothers day', 'mother day', 'mom birthday',
                'gift mom', 'for mom', 'mom present'
            ],
            'dad-gifts': [
                'dad', 'father', 'papa', 'daddy', 'paternal',
                'best gift for dad', 'gifts for dad', 'dad gifts',
                'fathers day', 'father day', 'dad birthday',
                'gift dad', 'for dad', 'dad present'
            ],
            'men-gifts': [
                'men', 'male', 'guy', 'boyfriend', 'husband', 'brother',
                'best gift for men', 'gifts for men', 'men gifts',
                'gift men', 'for men', 'men present',
                'boyfriend gift', 'husband gift', 'brother gift'
            ],
            'women-gifts': [
                'women', 'female', 'girl', 'girlfriend', 'wife', 'sister',
                'best gift for women', 'gifts for women', 'women gifts',
                'gift women', 'for women', 'women present',
                'girlfriend gift', 'wife gift', 'sister gift'
            ],
            'watches-gifts': [
                'watch', 'watches', 'timepiece', 'clock',
                'best watch', 'gift watch', 'watch gift',
                'luxury watch', 'smart watch', 'wrist watch'
            ],
            'perfumes-gifts': [
                'perfume', 'perfumes', 'fragrance', 'cologne', 'scent',
                'best perfume', 'gift perfume', 'perfume gift',
                'luxury perfume', 'designer perfume', 'men perfume', 'women perfume'
            ],
            'gift-guide': [
                'gift guide', 'gift ideas', 'gift suggestions',
                'best gifts', 'gift recommendations', 'what to gift',
                'gift help', 'gift advice', 'gift tips'
            ],
            'earn': [
                'earn', 'earning', 'money', 'cashback', 'rewards',
                'referral', 'referrals', 'apps', 'credit card', 'debit card',
                'loan', 'loans', 'make money', 'earn money'
            ]
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            for (const keyword of keywords) {
                if (searchTerm.includes(keyword)) {
                    return {
                        type: 'category',
                        title: this.getCategoryDisplayName(category),
                        link: `${category}.html`,
                        data: { category: category }
                    };
                }
            }
        }

        return null;
    }

    isExactMatch(text, searchTerm) {
        if (!text) return false;
        const textLower = text.toLowerCase();

        // Check for exact match
        if (textLower === searchTerm) return true;

        // Check for exact match with common variations
        const variations = [
            searchTerm,
            searchTerm + ' app',
            searchTerm + ' application',
            'google pay',
            'phonepe',
            'paytm',
            'cred',
            'amazon pay',
            'bharatpe'
        ];

        for (const variation of variations) {
            if (textLower.includes(variation) && variation.length > 3) {
                return true;
            }
        }

        return false;
    }

    searchAllData(searchTerm) {
        console.log('Searching for:', searchTerm);
        console.log('Search data available:', !!this.searchData);

        if (!this.searchData || !searchTerm.trim()) {
            console.log('No search data or empty term');
            return [];
        }

        const results = [];
        const term = searchTerm.toLowerCase();
        console.log('Search term processed:', term);

        // Search products
        if (this.searchData.products) {
            this.searchData.products.forEach(product => {
                if (this.matchesProduct(product, term)) {
                    results.push({
                        type: 'product',
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        image: product.image || product.images?.[0],
                        link: `index.html?item=${encodeURIComponent(product.title)}`,
                        category: 'Products'
                    });
                }
            });
        }

        // Search gifts
        Object.entries(this.searchData.gifts).forEach(([category, gifts]) => {
            gifts.forEach(gift => {
                if (this.matchesProduct(gift, term)) {
                    const categoryName = this.getCategoryDisplayName(category);
                    results.push({
                        type: 'gift',
                        title: gift.title,
                        description: gift.description,
                        price: gift.price,
                        image: gift.image || gift.images?.[0],
                        link: `${category}.html?item=${encodeURIComponent(gift.title)}`,
                        category: categoryName
                    });
                }
            });
        });

        // Search earn opportunities
        if (this.searchData.earn) {
            this.searchData.earn.forEach(item => {
                if (this.matchesEarnItem(item, term)) {
                    results.push({
                        type: 'earn',
                        title: item.name,
                        description: item.description,
                        reward: item.reward,
                        image: item.icon || item.logo,
                        link: 'earn.html',
                        category: 'Earn Money'
                    });
                }
            });
        }

        console.log('Total search results:', results.length);
        return results;
    }

    // Fuzzy search helper functions
    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len2][len1];
    }

    // Calculate similarity score (0-1, where 1 is perfect match)
    calculateSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;

        const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
        return 1 - (distance / maxLength);
    }

    // Check if search term is similar enough to target text
    isFuzzyMatch(searchTerm, targetText, threshold = 0.6) {
        const similarity = this.calculateSimilarity(searchTerm, targetText);
        return similarity >= threshold;
    }

    // Find fuzzy matches in text
    findFuzzyMatches(searchTerm, targetText, threshold = 0.6) {
        const words = targetText.toLowerCase().split(/\s+/);
        const searchWords = searchTerm.toLowerCase().split(/\s+/);

        for (const searchWord of searchWords) {
            for (const word of words) {
                if (this.isFuzzyMatch(searchWord, word, threshold)) {
                    return true;
                }
            }
        }
        return false;
    }

    matchesProduct(product, term) {
        // First try exact match
        if (product.title.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            (product.features && product.features.some(feature =>
                feature.toLowerCase().includes(term)
            )) ||
            (product.category && product.category.toLowerCase().includes(term))) {
            return true;
        }

        // Then try fuzzy match
        return this.findFuzzyMatches(term, product.title) ||
            this.findFuzzyMatches(term, product.description) ||
            (product.features && product.features.some(feature =>
                this.findFuzzyMatches(term, feature)
            )) ||
            (product.category && this.findFuzzyMatches(term, product.category));
    }

    matchesEarnItem(item, term) {
        // First try exact match
        if (item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            (item.category && item.category.toLowerCase().includes(term)) ||
            (item.type && item.type.toLowerCase().includes(term))) {
            return true;
        }

        // Then try fuzzy match
        return this.findFuzzyMatches(term, item.name) ||
            this.findFuzzyMatches(term, item.description) ||
            (item.category && this.findFuzzyMatches(term, item.category)) ||
            (item.type && this.findFuzzyMatches(term, item.type));
    }

    getCategoryDisplayName(category) {
        const categoryMap = {
            'men-gifts': 'Men Gifts',
            'women-gifts': 'Women Gifts',
            'mom-gifts': 'Mom Gifts',
            'dad-gifts': 'Dad Gifts',
            'watches-gifts': 'Watches',
            'perfumes-gifts': 'Perfumes'
        };
        return categoryMap[category] || category;
    }
}

// Initialize global search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.globalSearch = new GlobalSearch();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalSearch;
}
