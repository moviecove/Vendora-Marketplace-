# Vendora - Modern Marketplace Platform

A full-stack marketplace web application built with React, Tailwind CSS, and Supabase.

## 🎨 Brand Identity
- **Name:** Vendora
- **Colors:** Deep blue (#1e3a8a) + Orange accent (#f97316)
- **Logo:** Shopping bag icon with gradient

## ✨ Features

### Authentication
- Email/Password login
- Google OAuth integration
- Magic link authentication
- Role-based access (Buyer/Seller/Admin)

### For Buyers
- Browse verified seller products
- Advanced search and category filtering
- Wishlist functionality
- Secure messaging with sellers
- Order tracking

### For Sellers
- Seller verification system
- Product management (CRUD)
- Image uploads to Supabase Storage
- Boost listing feature for increased visibility
- Sales dashboard with analytics
- Revenue tracking (80% of sales)

### For Admins
- Seller verification approval/rejection
- Platform statistics
- User management
- Product oversight

### Boost Listing System
- 3 pricing tiers (24h, 3d, 7d)
- Priority placement in search results
- "🔥 Boosted" badge on listings
- Featured in homepage carousel
- Auto-expiry after duration
- 100% revenue to platform

### Payment Integration
- Paystack payment processing
- 80/20 revenue split (seller/platform)
- Transaction recording
- Webhook support ready

### Additional Features
- Responsive design
- Real-time messaging
- Product image galleries
- Category-based navigation
- User profiles
- Modern UI with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account
- A Paystack account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env` and add your keys:
   ```bash
   cp .env.example .env
   ```

4. Set up your Supabase database (see SETUP.md)

5. Run the development server:
   ```bash
   pnpm run dev
   ```

## 📖 Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- Environment configuration
- Database schema and migrations
- Supabase authentication setup
- Storage bucket configuration
- Paystack integration
- Deployment guide

## 🏗️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Paystack
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Form Handling:** React Hook Form
- **Toast Notifications:** Sonner

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── Layout.tsx    # Main layout with navbar
│   │   ├── ProtectedRoute.tsx
│   │   ├── AddProductDialog.tsx
│   │   └── BoostDialog.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── SellerDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── SellerProfile.tsx
│   │   ├── Wishlist.tsx
│   │   ├── Messages.tsx
│   │   └── NotFound.tsx
│   ├── routes.tsx
│   └── App.tsx
├── lib/
│   └── supabase.ts      # Supabase client & types
└── styles/
    ├── index.css
    └── theme.css
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for sensitive operations
- Input validation on both client and server
- Secure payment processing via Paystack
- Environment variables for sensitive keys

## 🎯 User Roles

### Buyer
- Browse and purchase products
- Wishlist management
- Message sellers
- View order history

### Seller (Verified)
- All buyer features
- List and manage products
- Boost listings for visibility
- Track sales and revenue
- Seller dashboard

### Admin
- Verify/reject sellers
- View platform statistics
- Manage users and products
- Admin dashboard

## 💳 Revenue Model

### Product Sales
- Seller receives 80%
- Platform receives 20%

### Boost Listings
- Platform receives 100%
- Pricing: ₦1,000 (24h), ₦2,500 (3d), ₦5,000 (7d)

## 🚨 Important Notes

1. Add `.env` to `.gitignore` (never commit API keys)
2. Use Paystack test keys during development
3. Set up proper RLS policies before production
4. Configure webhooks for payment verification
5. Enable Supabase email confirmations

## 📞 Support

For detailed setup instructions, troubleshooting, and deployment guides, see [SETUP.md](./SETUP.md).

## 📄 License

This project is created for educational and commercial use.

---

Built with ❤️ using React, Tailwind CSS, and Supabase
