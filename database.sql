-- ==============================
-- EXTENSIONS
-- ==============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- PROFILES
-- ==============================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller')),
  verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- PRODUCTS
-- ==============================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  image_url TEXT,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- CART
-- ==============================
CREATE TABLE cart (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================
-- WISHLIST
-- ==============================
CREATE TABLE wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================
-- ORDERS
-- ==============================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid',
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- REVIEWS (RATINGS SYSTEM)
-- ==============================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================
-- MESSAGES
-- ==============================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- VERIFICATION REQUESTS
-- ==============================
CREATE TABLE verification_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nin TEXT,
  bvn TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================
-- ENABLE RLS
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- ==============================
-- POLICIES
-- ==============================

-- PROFILES
CREATE POLICY "Public profiles view" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS
CREATE POLICY "Products public" 
ON products FOR SELECT USING (true);

CREATE POLICY "Only verified sellers can insert products"
ON products FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'seller' AND verified = true
  )
);

CREATE POLICY "Seller manage own products"
ON products FOR ALL
USING (auth.uid() = seller_id);

-- CART
CREATE POLICY "User cart access"
ON cart FOR ALL
USING (auth.uid() = user_id);

-- WISHLIST
CREATE POLICY "User wishlist access"
ON wishlist FOR ALL
USING (auth.uid() = user_id);

-- ORDERS
CREATE POLICY "User orders"
ON orders FOR ALL
USING (auth.uid() = user_id);

-- REVIEWS
CREATE POLICY "Users manage reviews"
ON reviews FOR ALL
USING (auth.uid() = user_id);

-- MESSAGES
CREATE POLICY "Private messages"
ON messages FOR ALL
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- VERIFICATION
CREATE POLICY "User verification access"
ON verification_requests FOR ALL
USING (auth.uid() = user_id);

-- ==============================
-- AUTO PROFILE CREATION
-- ==============================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

---------run this after the sql ---------
ALTER TABLE orders
ADD COLUMN seller_id UUID REFERENCES profiles(id);
