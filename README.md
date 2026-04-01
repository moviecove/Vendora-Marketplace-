# Vendora Marketplace

Vendora is a fully-featured, vanilla JavaScript marketplace web application integrated with **Supabase** (Backend as a Service) and **Paystack** (Payments).

## Features
- **Authentication**: Secure sign-up/login using Supabase Auth.
- **Marketplace**: Browse products, view details, search by categories.
- **Cart & Wishlist**: Persistent user collections handled directly via Supabase.
- **Messaging**: Peer-to-peer real-time communication between buyers and sellers.
- **Seller Flow**: 
    - Buyers can apply to become sellers.
    - Verification process: NIN/BVN and selfie upload.
    - Role-based dashboard: Only approved sellers can list products.
- **Payments**: Inline Paystack checkout integration.
- **Ratings**: 5-star rating system with comments for products.

## Prerequisites
- A modern web browser.
- A Supabase Project ([supabase.com](https://supabase.com)).
- A Paystack Account ([paystack.com](https://paystack.com)).

## Installation & Setup
1. **Clone the Repository**:
    No external dependencies (npm/yarn) are required as libraries are linked via CDN.

2. **Database Schema**:
    - Copy the contents of `database.sql`.
    - Go to your Supabase Project -> SQL Editor.
    - Paste and Run the script to create tables, triggers, and RLS policies.

3. **Supabase Configuration**:
    - Open `supabase.js`.
    - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project's credentials (found in Project Settings -> API).

4. **Paystack Configuration**:
    - Open `script.js`.
    - Update `PAYSTACK_PUBLIC_KEY` with your Paystack Test/Live Public Key.

5. **Storage**:
    - In Supabase -> Storage, create two public buckets: `product-images` and `verifications`.

## Running the App
Since this is a static vanilla JS application, you can:
- Open `index.html` directly in your browser.
- Use a VS Code extension like "Live Server".
- Host on any static hosting platform (Vercel, Netlify, GitHub Pages).

## Project Structure
- `index.html`: Main marketplace view.
- `styles.css`: Centralized UI styling.
- `supabase.js`: Supabase API wrappers.
- `script.js`: Global state management and UI initialization.
- `become-seller.html`: Seller verification portal.
- `seller-dashboard.html`: Restricted access area for approved sellers.
