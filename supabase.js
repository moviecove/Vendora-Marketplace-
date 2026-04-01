// ==============================
// SUPABASE CONFIG
// ==============================
const SUPABASE_URL = 'https://eidfwbrwzyuevsvbbyue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZGZ3YnJ3enl1ZXZzdmJieXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjY5ODQsImV4cCI6MjA5MDYwMjk4NH0.9Jg7RmceAEC2krzKE5yKsUu5Xzzgqu7mt3kXsXP3iA8';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==============================
// MAIN APP API
// ==============================
const Vendora = {

    // ==============================
    // AUTH
    // ==============================
    async signup(email, password, fullName) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) return { error };

        // ✅ Create profile immediately
        if (data.user) {
            await supabaseClient.from('profiles').insert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: 'buyer',
                verified: false
            });
        }

        return { data, error: null };
    },

    async login(email, password) {
        return await supabaseClient.auth.signInWithPassword({ email, password });
    },

    async logout() {
        return await supabaseClient.auth.signOut();
    },

    async getUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) return null;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            ...user,
            profile: profile || null
        };
    },

    // ==============================
    // PRODUCTS
    // ==============================
    async fetchProducts() {
        return await supabaseClient
            .from('products')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });
    },

    async fetchProductById(id) {
        return await supabaseClient
            .from('products')
            .select('*, profiles(*)')
            .eq('id', id)
            .single();
    },

    async addProduct(productData) {
        return await supabaseClient.from('products').insert([productData]);
    },

    async getSellerProducts(userId) {
        return await supabaseClient
            .from('products')
            .select('*')
            .eq('seller_id', userId);
    },

    // ==============================
    // CART
    // ==============================
    async addToCart(productId, userId) {
        return await supabaseClient.from('cart').upsert([{
            product_id: productId,
            user_id: userId,
            quantity: 1
        }]);
    },

    async getCart(userId) {
        return await supabaseClient
            .from('cart')
            .select('*, products(*)')
            .eq('user_id', userId);
    },

    async removeFromCart(id) {
        return await supabaseClient.from('cart').delete().eq('id', id);
    },

    // ==============================
    // WISHLIST
    // ==============================
    async addToWishlist(productId, userId) {
        return await supabaseClient.from('wishlist').upsert([{
            product_id: productId,
            user_id: userId
        }]);
    },

    async getWishlist(userId) {
        return await supabaseClient
            .from('wishlist')
            .select('*, products(*)')
            .eq('user_id', userId);
    },

    async removeFromWishlist(id) {
        return await supabaseClient.from('wishlist').delete().eq('id', id);
    },

    // ==============================
    // VERIFICATION (SELLER)
    // ==============================
    async submitVerification(payload) {
        return await supabaseClient
            .from('verification_requests')
            .insert([{
                ...payload,
                status: 'pending'
            }]);
    },

    async getVerificationStatus(userId) {
        return await supabaseClient
            .from('verification_requests')
            .select('*')
            .eq('user_id', userId)
            .single();
    },

    // ==============================
    // REVIEWS / RATINGS
    // ==============================
    async addReview(userId, productId, rating, comment) {
        return await supabaseClient.from('reviews').insert([{
            user_id: userId,
            product_id: productId,
            rating,
            comment
        }]);
    },

    async getReviews(productId) {
        return await supabaseClient
            .from('reviews')
            .select('*, profiles(full_name)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
    },

    // ==============================
    // ORDERS (FOR PAYSTACK)
    // ==============================
    async createOrder(userId, productId) {
        return await supabaseClient.from('orders').insert([{
            user_id: userId,
            product_id: productId,
            status: 'pending',
            payment_status: 'unpaid'
        }]);
    },

    async updateOrderPayment(orderId, reference) {
        return await supabaseClient
            .from('orders')
            .update({
                payment_status: 'paid',
                payment_reference: reference,
                status: 'completed'
            })
            .eq('id', orderId);
    },

    // ==============================
    // MESSAGES
    // ==============================
    async getMessages(userId) {
        return await supabaseClient
            .from('messages')
            .select(`
                *,
                sender:profiles!sender_id(full_name),
                receiver:profiles!receiver_id(full_name)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: true });
    },

    async sendMessage(senderId, receiverId, content) {
        return await supabaseClient.from('messages').insert([{
            sender_id: senderId,
            receiver_id: receiverId,
            content
        }]);
    },

    // ==============================
    // STORAGE
    // ==============================
    async uploadFile(bucket, path, file) {
        const { error } = await supabaseClient.storage.from(bucket).upload(path, file);

        if (error) return { error };

        const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);

        return { url: data.publicUrl };
    }
};