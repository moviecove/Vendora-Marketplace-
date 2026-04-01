import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual Supabase credentials
// Get these from your Supabase project settings at https://supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eidfwbrwzyuevsvbbyue.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZGZ3YnJ3enl1ZXZzdmJieXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjY5ODQsImV4cCI6MjA5MDYwMjk4NH0.9Jg7RmceAEC2krzKE5yKsUu5Xzzgqu7mt3kXsXP3iA8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  is_boosted: boolean;
  boost_expiry?: string;
  created_at: string;
  updated_at: string;
  seller?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  seller_amount: number;
  platform_amount: number;
  paystack_reference: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id?: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface BoostPlan {
  duration: '24h' | '3d' | '7d';
  price: number;
  label: string;
}

export const BOOST_PLANS: BoostPlan[] = [
  { duration: '24h', price: 1000, label: '24 Hours' },
  { duration: '3d', price: 2500, label: '3 Days' },
  { duration: '7d', price: 5000, label: '7 Days' },
];
