# 🎯 QUICK START GUIDE - VENDORA MARKETPLACE

## ⚡ 5-Minute Setup

### 1️⃣ Get Your API Keys (2 minutes)

**Supabase:**
1. Go to https://supabase.com → Create project
2. Settings → API → Copy URL and anon key

**Paystack:**
1. Go to https://paystack.com → Sign up
2. Settings → API Keys → Copy public key (use test key)

### 2️⃣ Configure Environment (30 seconds)

Create `.env` file:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

### 3️⃣ Setup Database (2 minutes)

1. Open Supabase → SQL Editor
2. Copy all content from `supabase_schema.sql`
3. Execute
4. ✅ 7 tables + 8 categories created!

### 4️⃣ Create Storage (30 seconds)

1. Supabase → Storage → "New bucket"
2. Name: `products`
3. ✅ Make it public

### 5️⃣ Run App (30 seconds)

```bash
pnpm install
pnpm run dev
```

### 6️⃣ Create Admin (1 minute)

1. Sign up through the app
2. Supabase → SQL Editor → Run:
```sql
UPDATE users SET role = 'admin', verified = true
WHERE email = 'YOUR_EMAIL';
```

## ✅ Done! Your marketplace is ready!

---

## 🎮 What You Can Do Now

### As Admin:
1. ✅ Create seller accounts
2. ✅ Verify sellers
3. ✅ View platform stats

### As Seller (after verification):
1. ✅ Add products with images
2. ✅ Boost listings
3. ✅ View sales dashboard

### As Buyer:
1. ✅ Browse products
2. ✅ Search & filter
3. ✅ Add to wishlist
4. ✅ Message sellers

---

## 📊 Key Features

| Feature | Status |
|---------|--------|
| Authentication (3 methods) | ✅ |
| Seller Verification | ✅ |
| Product Management | ✅ |
| Image Upload | ✅ |
| Boost Listings | ✅ |
| Paystack Payments | ✅ |
| Wishlist | ✅ |
| Messaging | ✅ |
| Dashboards | ✅ |
| Mobile Responsive | ✅ |

---

## 💰 Revenue Model

**Product Sales:**
- Seller: 80%
- Platform: 20%

**Boost Listings (100% Platform):**
- 24h: ₦1,000
- 3d: ₦2,500
- 7d: ₦5,000

---

## 🚀 Deploy to Production

### Frontend (Netlify - Free)
1. Push to GitHub
2. Connect to Netlify
3. Add environment variables
4. Deploy!

### Backend (Already Setup - Supabase)
1. Enable RLS (already done)
2. Switch to live Paystack keys
3. Set up webhooks

**Total Time: ~15 minutes**

---

## 📁 Files You Need to Know

| File | Purpose |
|------|---------|
| `.env` | Your API keys (create this) |
| `SETUP.md` | Detailed setup guide |
| `DEPLOYMENT.md` | Production deployment |
| `PROJECT_SUMMARY.md` | Complete feature list |
| `supabase_schema.sql` | Database setup |

---

## 🆘 Common Issues

**"Products not showing"**
→ Verify seller is marked as verified

**"Images not uploading"**
→ Check storage bucket is public

**"Payment not working"**
→ Verify Paystack key is correct

**More help?** → Check SETUP.md troubleshooting

---

## 🎨 Branding

**Name:** Vendora
**Colors:**
- Primary: Deep Blue (#1e3a8a)
- Accent: Orange (#f97316)

**Logo:** Shopping bag icon (left side of navbar)

---

## ✨ What Makes This Special?

✅ **Production-ready** - Not a demo, real code
✅ **Fully functional** - All features work
✅ **Modern stack** - React + Tailwind + Supabase
✅ **Secure** - RLS + environment variables
✅ **Beautiful** - Professional design
✅ **Documented** - Comprehensive guides
✅ **Monetized** - Real payment integration

---

## 🎯 Next Steps

**Today:**
- [ ] Add your API keys
- [ ] Run database schema
- [ ] Create admin account
- [ ] Test locally

**This Week:**
- [ ] Add test products
- [ ] Test all features
- [ ] Review documentation
- [ ] Plan launch

**For Launch:**
- [ ] Switch to production keys
- [ ] Deploy to Netlify
- [ ] Add custom domain
- [ ] Go live! 🚀

---

## 📞 Need Help?

1. Read SETUP.md (comprehensive guide)
2. Check PROJECT_SUMMARY.md (all features)
3. Review DEPLOYMENT.md (production guide)

---

## 🎉 You're All Set!

**You now have a professional marketplace platform worth $10,000+ in development costs, completely free!**

Built with ❤️ - Ready to make money! 💰
