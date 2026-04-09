// =========================================================================
// 1. PAGE LOADERS & GLOBAL SCROLL EVENTS
// =========================================================================

// Remove loader once the page is fully loaded
window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 1000);
});


// Handle Scroll Progress bar and Scroll-To-Top button visibility
window.addEventListener('scroll', () => {
    // Scroll Progress
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("scroll-progress").style.width = scrolled + "%";

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});


// =========================================================================
// 2. DARK / LIGHT THEME TOGGLE
// =========================================================================
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check local storage for saved theme preference on load
if(localStorage.getItem('theme') === 'light') {
    htmlElement.setAttribute('data-theme', 'light');
    themeToggle.classList.replace('fa-moon', 'fa-sun');
}

// Toggle functionality
themeToggle.addEventListener('click', () => {
    if (htmlElement.getAttribute('data-theme') === 'dark') {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggle.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light'); // Save to browser storage
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark'); // Save to browser storage
    }
});


// =========================================================================
// 3. SINGLE PAGE APPLICATION (SPA) NAVIGATION LOGIC
// =========================================================================
const navLinks = document.querySelectorAll('.nav-btn');
const pageSections = document.querySelectorAll('.page-section');

function navigateTo(targetId) {
    // Hide all sections
    pageSections.forEach(section => section.classList.remove('active-page'));
    
    // Show the target section
    const targetSection = document.getElementById(targetId);
    if(targetSection) targetSection.classList.add('active-page');

    // Update the active state in the navigation bar
    navLinks.forEach(link => link.classList.remove('active-nav'));
    const activeLink = document.querySelector(`.nav-btn[href="#${targetId}"]`);
    if(activeLink) activeLink.classList.add('active-nav');
    
    // Re-trigger Intersection Observer animations for the new page view
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.remove('show');
        setTimeout(() => observer.observe(el), 100);
    });

    // Scroll to top of the page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach click listeners to all navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1); // Remove the '#'
        navigateTo(targetId);
    });
});


// =========================================================================
// 4. E-COMMERCE CART SYSTEM (Uses Local Storage)
// =========================================================================
let cart = JSON.parse(localStorage.getItem('gptech_cart')) || []; // Fetch existing cart or start empty
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const cartFooter = document.getElementById('cart-footer');
const cartTotalPrice = document.getElementById('cart-total-price');
const toastContainer = document.getElementById('toast-container');

// Core function to update UI and save state
function updateCartUI() {
    // Save current cart array to browser local storage
    localStorage.setItem('gptech_cart', JSON.stringify(cart));
    
    // Update red notification badge count
    cartBadge.innerText = cart.length;

    // Clear current HTML
    cartItemsContainer.innerHTML = '';
    let total = 0;

    // Conditional Rendering based on Cart state
    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
        cartFooter.style.display = 'none';
    } else {
        emptyCartMsg.style.display = 'none';
        cartFooter.style.display = 'block';

        // Map through cart items and build HTML
        cart.forEach((item, index) => {
            total += item.price;
            const itemHTML = `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)}</p>
                    </div>
                    <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})"></i>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
        
        // Update Total Price display
        cartTotalPrice.innerText = `$${total.toFixed(2)}`;
    }
}

// Global function triggered by the trash can icon
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// Add event listeners to all 'Add to Cart' buttons
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Find product details traversing the DOM
        const productCard = e.target.closest('.product-card') || e.target.closest('.modal-info');
        const name = productCard.querySelector('h3') ? productCard.querySelector('h3').innerText : productCard.querySelector('h2').innerText;
        const priceText = e.target.getAttribute('data-price') || productCard.querySelector('.price').innerText.replace('$', '');
        const price = parseFloat(priceText);

        // Push to array and update
        cart.push({ name, price });
        updateCartUI();

        // Create and display Toast Notification
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = `<i class="fas fa-cart-plus"></i> ${name} added to cart!`;
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => toast.remove(), 3000);
    });
});

// Initialize Cart UI on page load
updateCartUI();


// Sidebar Open/Close Logic
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');

cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));


// =========================================================================
// 5. 3D ROTATING CUBE LOGIC (Restored Animation)
// =========================================================================
let x = 0;
let y = 20;
let z = 0;
let bool = true;
let interval;

const cube = document.getElementById('hero-cube');
const controls = document.querySelector('.controls');

if(cube && controls) {
    // Manual Button Controls
    document.querySelector('.top-x-control').addEventListener('click', (e) => { e.preventDefault(); cube.style.transform = `rotateX(${x += 20}deg) rotateY(${y}deg) rotateZ(${z}deg)`; });
    document.querySelector('.bottom-x-control').addEventListener('click', (e) => { e.preventDefault(); cube.style.transform = `rotateX(${x -= 20}deg) rotateY(${y}deg) rotateZ(${z}deg)`; });
    document.querySelector('.left-y-control').addEventListener('click', (e) => { e.preventDefault(); cube.style.transform = `rotateX(${x}deg) rotateY(${y -= 20}deg) rotateZ(${z}deg)`; });
    document.querySelector('.right-y-control').addEventListener('click', (e) => { e.preventDefault(); cube.style.transform = `rotateX(${x}deg) rotateY(${y += 20}deg) rotateZ(${z}deg)`; });
    document.querySelector('.top-z-control').addEventListener('click', (e) => { e.preventDefault(); cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z -= 20}deg)`; });
    document.querySelector('.bottom-z-control').addEventListener('click', (e) => { e.preventDefault(); cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z += 20}deg)`; });

    // Auto-play Function
    const playPause = () => {
        if(bool) {
            interval = setInterval(() => {
                cube.style.transform = `rotateX(${x}deg) rotateY(${y++}deg) rotateZ(${z}deg)`;
            }, 50); // Speed of rotation
        } else {
            clearInterval(interval);
        }
    };

    // Start auto-play on load
    playPause();

    // Pause on hover over controls or cube
    controls.addEventListener('mouseover', () => { bool = false; playPause(); });
    controls.addEventListener('mouseout', () => { bool = true; playPause(); });
    cube.addEventListener('mouseover', () => { bool = false; playPause(); });
    cube.addEventListener('mouseout', () => { bool = true; playPause(); });
}


// =========================================================================
// 6. LIVE SEARCH & CATEGORY FILTERING LOGIC
// =========================================================================
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

// Live Search logic
searchInput.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();
    
    // Reset category buttons visually when searching
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');

    // Filter products
    productCards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(term)) {
            card.style.display = 'block';
            setTimeout(() => card.classList.add('show'), 10);
        } else {
            card.style.display = 'none';
            card.classList.remove('show');
        }
    });
});

// Category Button logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Clear search input when switching categories
        searchInput.value = ''; 
        
        // Handle active button styling
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter products by data-category attribute
        const filterValue = btn.getAttribute('data-filter');
        productCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                setTimeout(() => card.classList.add('show'), 50);
            } else {
                card.style.display = 'none';
                card.classList.remove('show');
            }
        });
    });
});


// =========================================================================
// 7. PRODUCT QUICK-VIEW MODAL LOGIC
// =========================================================================
const modalOverlay = document.getElementById('quick-view-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');

// Open modal and inject data when a product card is clicked
productCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Prevent opening modal if the user specifically clicked "Add to Cart"
        if(e.target.classList.contains('add-to-cart-btn')) return;

        // Extract data from the clicked card
        modalImg.src = card.querySelector('img').src;
        modalTitle.innerText = card.querySelector('h3').innerText;
        modalPrice.innerText = card.querySelector('p').innerText;

        // Display Modal
        modalOverlay.classList.add('active');
    });
});

// Close Modal functions
closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => { 
    // Close if clicking the dark overlay background (outside the modal content)
    if (e.target === modalOverlay) modalOverlay.classList.remove('active'); 
});


// =========================================================================
// 8. INTERSECTION OBSERVER (Scroll Animations)
// =========================================================================
const observerOptions = { 
    threshold: 0.1, 
    rootMargin: "0px 0px -50px 0px" 
};

// Create Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Add 'show' class when element enters viewport
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); // Unobserve after animation triggers once
        }
    });
}, observerOptions);

// Attach Observer to all elements with the animation class
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));