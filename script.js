// ==============================
// CONFIG
// ==============================
const PAYSTACK_PUBLIC_KEY = 'pk_live_ffae456b09b2f3bf7d37c9e2a5e1cb67cd1e37f9';

// ==============================
// INIT APP
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
    setupAuthListener();
    loadPageSpecifics();
});

// ==============================
// 🔥 AUTH STATE LISTENER (MAIN FIX)
// ==============================
function setupAuthListener() {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        updateNavbar(session?.user || null);
    });

    // Run immediately on load
    supabaseClient.auth.getSession().then(({ data }) => {
        updateNavbar(data.session?.user || null);
    });
}

// ==============================
// NAVBAR CONTROL
// ==============================
async function updateNavbar(user) {
    const navAuth = document.getElementById('auth-links');
    const navUser = document.getElementById('user-links');

    if (user) {
        const fullUser = await Vendora.getUser();

        if (navAuth) navAuth.classList.add('hidden');
        if (navUser) navUser.classList.remove('hidden');

        // Seller logic
        const becomeSellerLink = document.querySelectorAll('.become-seller-link');
        const sellerDashLink = document.getElementById('seller-dashboard-link');

        if (fullUser?.profile?.role === 'seller') {
            becomeSellerLink.forEach(el => el.classList.add('hidden'));

            // Only show dashboard if VERIFIED
            if (fullUser.profile.verified) {
                if (sellerDashLink) sellerDashLink.classList.remove('hidden');
            }
        }

    } else {
        if (navAuth) navAuth.classList.remove('hidden');
        if (navUser) navUser.classList.add('hidden');

        protectRoutes();
    }
}

// ==============================
// 🔐 ROUTE PROTECTION
// ==============================
function protectRoutes() {
    const protectedPages = [
        'cart.html',
        'wishlist.html',
        'profile.html',
        'messages.html',
        'seller-dashboard.html',
        'add-product.html',
        'my-products.html'
    ];

    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage)) {
        window.location.href = 'login.html';
    }
}

// ==============================
// LOGOUT
// ==============================
async function handleLogout() {
    await Vendora.logout();
    window.location.href = 'index.html';
}

// ==============================
// PAGE ROUTER
// ==============================
function loadPageSpecifics() {
    const page = window.location.pathname.split('/').pop();

    switch (page) {
        case '':
        case 'index.html':
            loadHomeProducts();
            break;

        case 'product.html':
            loadProductDetails();
            break;

        case 'cart.html':
            loadCartItems();
            break;

        case 'wishlist.html':
            loadWishlistItems();
            break;

        case 'messages.html':
            loadChats();
            break;
    }
}

// ==============================
// UI HELPERS
// ==============================
function formatPrice(amt) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amt);
}

// ==============================
// 🏠 HOME PRODUCTS
// ==============================
async function loadHomeProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '<p>Loading products...</p>';

    const { data, error } = await Vendora.fetchProducts();

    if (error || !data) {
        grid.innerHTML = '<p>Failed to load products.</p>';
        return;
    }

    if (data.length === 0) {
        grid.innerHTML = '<p>No products found.</p>';
        return;
    }

    grid.innerHTML = data.map(p => `
        <div class="card">
            <a href="product.html?id=${p.id}">
                <img src="${p.image_url || 'https://via.placeholder.com/300'}" alt="${p.title}">
            </a>
            <div class="card-body">
                <p style="font-size: 0.8rem; color: #777;">
                    ${p.category || 'General'}
                </p>

                <h3 class="card-title">${p.title}</h3>

                <p class="card-price">${formatPrice(p.price)}</p>

                <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                    Seller: ${p.profiles?.full_name || 'Unknown'}
                </p>
            </div>
        </div>
    `).join('');
}

// ==============================
// 🛒 CART (CONNECTED TO DB)
// ==============================
async function loadCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    const user = await Vendora.getUser();
    if (!user) return;

    const { data } = await Vendora.getCart(user.id);

    if (!data || data.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="card">
            <h3>${item.products.title}</h3>
            <p>${formatPrice(item.products.price)}</p>
            <button onclick="removeCart('${item.id}')">Remove</button>
        </div>
    `).join('');
}

async function removeCart(id) {
    await Vendora.removeFromCart(id);
    loadCartItems();
}

// ==============================
// ❤️ WISHLIST (NO LOCAL STORAGE)
// ==============================
async function loadWishlistItems() {
    const container = document.getElementById('wishlist-items');
    if (!container) return;

    const user = await Vendora.getUser();
    if (!user) return;

    const { data } = await Vendora.getWishlist(user.id);

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No wishlist items</p>';
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="card">
            <h3>${item.products.title}</h3>
            <p>${formatPrice(item.products.price)}</p>
            <button onclick="removeWishlist('${item.id}')">Remove</button>
        </div>
    `).join('');
}

async function removeWishlist(id) {
    await Vendora.removeFromWishlist(id);
    loadWishlistItems();
}