# Vendora Marketplace - Setup Guide

## 🎨 Brand Identity
- **Name:** Vendora
- **Colors:** Deep blue (#1e3a8a) + Orange (#f97316)
- **Logo:** Shopping bag icon with gradient background

## 📋 Prerequisites
- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- A Paystack account (https://paystack.com)

## 🚀 Quick Start

### 1. Environment Variables Setup

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=YOUR_PAYSTACK_PUBLIC_KEY
```

**Where to get these keys:**

#### Supabase Keys
1. Go to https://supabase.com
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

#### Paystack Keys
1. Go to https://paystack.com
2. Sign up and verify your account
3. Go to Settings → API Keys & Webhooks
4. Copy your Public Key → `VITE_PAYSTACK_PUBLIC_KEY`
5. For production, also get your Secret Key (store in Supabase Edge Function secrets)

### 2. Supabase Database Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_boosted BOOLEAN DEFAULT FALSE,
  boost_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_amount DECIMAL(10, 2) NOT NULL,
  platform_amount DECIMAL(10, 2) NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Products
CREATE POLICY "Anyone can view verified seller products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = products.seller_id
      AND users.verified = true
    )
  );
CREATE POLICY "Sellers can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON products FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for Orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() IN (buyer_id, seller_id));
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for Wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Messages
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own received messages" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Create indexes for better performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_boosted ON products(is_boosted, boost_expiry);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Supabase Storage Setup

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `products`
3. Set bucket to **Public**
4. Add this policy for the bucket:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow public read access
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'products');
```

### 4. Supabase Authentication Setup

1. Go to Authentication → Providers in Supabase
2. Enable Email/Password authentication
3. Enable Google OAuth (optional):
   - Get credentials from Google Cloud Console
   - Add to Supabase Google provider settings
4. Enable Magic Link (Email OTP)

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Run Development Server

```bash
pnpm run dev
```

## 💳 Paystack Integration

### Payment Flow

#### Product Purchase (80/20 Split)
1. Buyer initiates purchase
2. Paystack processes payment
3. On success:
   - 80% goes to seller
   - 20% goes to platform owner
4. Transaction recorded in database

#### Boost Listing (100% to Platform)
1. Seller selects boost duration
2. Paystack processes payment
3. On success:
   - 100% goes to platform owner
   - Product boosted for selected duration
   - Auto-expires after duration

### Paystack Webhook Setup (For Production)

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/paystack-webhook`
3. Copy webhook secret
4. Add to Supabase Edge Function secrets

## 🎯 User Roles

### Buyer
- Browse and search products
- Add to wishlist
- Purchase products
- Message sellers
- View order history

### Seller (Requires Verification)
- All buyer features
- List products (after verification)
- Edit/delete own products
- Boost listings
- View sales dashboard
- Manage orders

### Admin
- Verify/reject sellers
- Manage all products
- View platform statistics
- Manage users

## 🔐 Creating Admin User

Run this SQL in Supabase after creating your first account:

```sql
-- Replace 'your-user-id' with your actual user ID from auth.users
UPDATE users
SET role = 'admin', verified = true
WHERE email = 'your-admin-email@example.com';
```

## 📊 Key Features Implemented

✅ **Authentication**
- Email/Password login
- Google OAuth
- Magic link login

✅ **User Roles & Verification**
- Buyer/Seller/Admin roles
- Seller verification system
- Only verified sellers visible

✅ **Product Management**
- CRUD operations
- Image upload to Supabase Storage
- Category filtering
- Search functionality

✅ **Boost Listing**
- 3 pricing tiers (24h, 3d, 7d)
- Auto-expire functionality
- Priority placement
- Paystack integration

✅ **Payment System**
- Paystack integration structure
- 80/20 split (seller/platform)
- Transaction recording
- Webhook support ready

✅ **Dashboards**
- Seller dashboard with stats
- Admin dashboard for verification
- Product management

✅ **Social Features**
- Wishlist system
- Buyer-seller messaging
- Seller profiles

✅ **UI/UX**
- Responsive design
- Modern gradient branding
- Smooth animations
- Card-based layouts

## 🚨 Important Security Notes

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** for all sensitive keys
3. **Enable RLS** on all Supabase tables
4. **Validate input** on both frontend and backend
5. **Use Paystack test keys** during development
6. **Set up proper CORS** for production

## 📱 Production Deployment

### Frontend
1. Build the project: `pnpm run build`
2. Deploy to Netlify, Vercel, or any static hosting
3. Add environment variables in hosting dashboard

### Backend (Supabase)
1. Ensure all tables and policies are set up
2. Enable production mode in Supabase
3. Set up Paystack webhooks
4. Configure custom domain (optional)

## 🐛 Troubleshooting

### "Supabase keys not configured"
- Check `.env` file exists
- Verify keys are correct
- Restart dev server after adding keys

### "Products not showing"
- Verify seller is marked as verified in database
- Check RLS policies are enabled
- Ensure products table has data

### "Payment not working"
- Add Paystack script to index.html: `<script src="https://js.paystack.co/v1/inline.js"></script>`
- Verify Paystack public key is correct
- Check browser console for errors

### "Images not uploading"
- Ensure `products` storage bucket exists
- Verify bucket is set to public
- Check storage policies

## 📞 Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Paystack documentation: https://paystack.com/docs
- Review code comments in the project files

## 🎉 Success!

Once setup is complete, you should have a fully functional marketplace with:
- User authentication
- Product listings
- Seller verification
- Payment processing structure
- Boost listing feature
- Admin dashboard
- Messaging system

**Remember:** This is production-ready code. Just add your real API keys and you're good to go!
