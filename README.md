<h1>Deal Snatcher 🛍️ - Cool Products & Gadgets Website</h1>

<p>
    <a href="https://deal-snatcher.com">Website Online</a> | 
    <a href="LICENSE">MIT License</a>
</p>

<h2>Features</h2>
<ul>
    <li>Responsive Design – Works on desktop, tablet, and mobile</li>
    <li>Product Grid – Beautiful card-based layout showcasing products</li>
    <li>Real-time Search – Search product titles and descriptions</li>
    <li>Category Filtering – Filter products by Gadgets, Home, Tech, Outdoor</li>
    <li>Sorting Options – Sort by newest, most popular, or price</li>
    <li>Product Modal – Detailed view with images and information</li>
    <li>Load More – Pagination with "Load More" button</li>
    <li>Modern UI – Clean design with smooth animations and hover effects</li>
</ul>

<h2>Technologies Used</h2>
<ul>
    <li>HTML5 – Semantic markup</li>
    <li>Tailwind CSS – Utility-first CSS framework</li>
    <li>JavaScript – Interactive functionality</li>
    <li>Font Awesome – Icons for visuals</li>
    <li>Unsplash – High-quality images</li>
</ul>

<h2>File Structure</h2>
<pre>
deal-snatcher.com/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── products.json       # Product data (JSON format)
└── README.html         # This file
</pre>

<h2>How to Use</h2>
<ol>
    <li>Open <code>index.html</code> in a browser</li>
    <li>Browse products in the grid</li>
    <li>Use the search bar to find specific products</li>
    <li>Click category buttons to filter products</li>
    <li>Sort using the dropdown menu</li>
    <li>Click a product card to view details</li>
    <li>Click "Load More Products" to see more items</li>
</ol>

<h2>Product Management</h2>
<h3>Adding New Products</h3>
<pre>
{
  "id": 13,
  "title": "Your Product Name",
  "description": "Detailed product description here",
  "price": 29.99,
  "originalPrice": 49.99,
  "image": "https://your-image-url.com/main-image.jpg",
  "images": [
    "https://your-image-url.com/image1.jpg",
    "https://your-image-url.com/image2.jpg",
    "https://your-image-url.com/image3.jpg"
  ],
  "youtubeVideo": "https://www.youtube.com/watch?v=your-video-id",
  "affiliateLink": "https://your-affiliate-link.com/product",
  "category": "gadgets",
  "rating": 4.5,
  "reviews": 100,
  "brand": "Your Brand",
  "availability": "in-stock"
}
</pre>

<h3>Removing / Editing Products</h3>
<ul>
    <li>Remove: Delete the product object from <code>products.json</code></li>
    <li>Edit: Update product details in <code>products.json</code> (changes auto-reflect)</li>
</ul>

<h3>Customization</h3>
<p>Change colors in Tailwind config in <code>index.html</code>:</p>
<pre>
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#3B82F6',
                secondary: '#1E40AF',
                accent: '#F59E0B',
            }
        }
    }
}
</pre>

<h2>Browser Support</h2>
<ul>
    <li>Chrome (recommended)</li>
    <li>Firefox</li>
    <li>Safari</li>
    <li>Edge</li>
    <li>Mobile browsers</li>
</ul>

<h2>Future Enhancements</h2>
<ul>
    <li>Shopping cart functionality</li>
    <li>User authentication</li>
    <li>Product reviews and ratings</li>
    <li>Wishlist feature</li>
    <li>Social media integration</li>
    <li>Newsletter subscription</li>
    <li>Product comparison tool</li>
</ul>

<h2>License</h2>
<p>This project is open source and available under the <strong>MIT License</strong>.</p>
