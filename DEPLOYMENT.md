# Vendora Deployment Guide

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Supabase database schema applied
- [ ] Supabase storage buckets created
- [ ] Supabase authentication providers enabled
- [ ] Supabase RLS policies enabled
- [ ] Admin user created
- [ ] Paystack account verified
- [ ] Paystack webhook configured
- [ ] Test all critical flows
- [ ] Build passes without errors

### Environment Variables

Create these in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
```

**Important:** Use production keys, not test keys!

## 📦 Frontend Deployment

### Option 1: Netlify (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `pnpm run build`
     - Publish directory: `dist`
   - Add environment variables
   - Deploy!

3. **Custom Domain** (Optional)
   - Add your domain in Netlify settings
   - Update DNS records as instructed
   - Enable HTTPS (automatic)

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   # Follow prompts
   ```

3. **Add Environment Variables**
   - Go to project settings on Vercel dashboard
   - Add production environment variables

### Option 3: Static Hosting (AWS S3, Digital Ocean, etc.)

1. **Build**
   ```bash
   pnpm run build
   ```

2. **Upload**
   - Upload contents of `dist/` folder
   - Configure as static website
   - Enable gzip compression
   - Set cache headers

## 🗄️ Backend (Supabase) Setup

### 1. Production Database

```bash
# Run the schema file
# Go to Supabase Dashboard → SQL Editor
# Copy paste contents of supabase_schema.sql
# Execute
```

### 2. Storage Configuration

1. Create `products` bucket
2. Set to public
3. Add policies:
   ```sql
   -- Upload policy
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'products');

   -- Read policy
   CREATE POLICY "Public can view"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'products');
   ```

### 3. Authentication Setup

1. **Email/Password**
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates
   - Set site URL to your production domain

2. **Google OAuth**
   - Get OAuth credentials from Google Cloud Console
   - Add to Supabase Google provider
   - Add authorized redirect URIs

3. **Magic Link**
   - Already enabled with email provider
   - Customize email template

### 4. Security Settings

1. **Allowed Redirect URLs**
   ```
   https://your-domain.com/*
   ```

2. **CORS Settings**
   - Add your production domain

3. **Rate Limiting**
   - Enable in Supabase dashboard
   - Recommended: 10 requests/second

## 💳 Paystack Configuration

### 1. Account Setup

1. Complete KYC verification on Paystack
2. Add bank account for settlements
3. Set up settlement schedule

### 2. API Keys

- Use **LIVE** public key in production
- Store secret key in Supabase Edge Function secrets

### 3. Webhook Setup

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-api-url.com/paystack-webhook`
3. Copy webhook secret
4. Store in Supabase secrets:
   ```bash
   supabase secrets set PAYSTACK_WEBHOOK_SECRET=your_secret
   ```

### 4. Test Transactions

- Do test transaction with live keys
- Verify webhook receives data
- Check database updates

## 🔐 Security Hardening

### 1. Environment Variables

- Never commit `.env` files
- Use different keys for dev/prod
- Rotate keys periodically

### 2. Supabase RLS

```sql
-- Verify all tables have RLS enabled
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_policies
);
-- Should return empty
```

### 3. Rate Limiting

Add to your hosting platform:
- Login attempts: 5/minute
- API calls: 100/minute
- File uploads: 10/minute

### 4. Content Security Policy

Add to Netlify/Vercel config:
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## 📊 Post-Deployment

### 1. Create Admin Account

```sql
-- After creating your first account, run:
UPDATE public.users
SET role = 'admin', verified = true
WHERE email = 'your-admin-email@example.com';
```

### 2. Test Critical Flows

- [ ] User registration (buyer & seller)
- [ ] Login (all methods)
- [ ] Product creation (seller)
- [ ] Product search & filter
- [ ] Wishlist functionality
- [ ] Messaging
- [ ] Purchase flow (test mode)
- [ ] Boost listing
- [ ] Admin seller verification

### 3. Monitoring Setup

1. **Supabase Dashboard**
   - Monitor API usage
   - Check error logs
   - Track storage usage

2. **Paystack Dashboard**
   - Monitor transactions
   - Check webhook deliveries
   - Track revenue

3. **Analytics** (Optional)
   - Add Google Analytics
   - Set up conversion tracking
   - Monitor user flows

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add production URL to Supabase allowed origins
   - Check authentication redirect URLs

2. **Authentication Not Working**
   - Verify email templates sent
   - Check site URL in Supabase settings
   - Ensure redirect URLs whitelisted

3. **Images Not Loading**
   - Check storage bucket is public
   - Verify storage policies
   - Check CORS on storage bucket

4. **Payments Failing**
   - Verify using LIVE Paystack keys
   - Check webhook is receiving events
   - Review Paystack dashboard logs

5. **Products Not Showing**
   - Ensure sellers are verified
   - Check RLS policies
   - Verify product status is 'active'

## 📈 Performance Optimization

### 1. Images

- Use WebP format
- Compress before upload
- Add CDN (Cloudflare)
- Lazy load images

### 2. Database

- Indexes already created in schema
- Monitor slow queries
- Use connection pooling

### 3. Frontend

- Code splitting (already configured)
- Enable gzip compression
- Use production builds only
- Add service worker (PWA)

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

## 📞 Support & Maintenance

### Regular Tasks

- **Weekly**
  - Review transaction logs
  - Check for errors
  - Monitor performance

- **Monthly**
  - Update dependencies
  - Review security patches
  - Backup database

- **Quarterly**
  - Security audit
  - Performance optimization
  - User feedback review

### Backups

Supabase auto-backups (paid plans):
- Enable daily backups
- Test restore procedure
- Keep 30-day retention

## 🎉 Launch Checklist

- [ ] All features tested
- [ ] Admin account created
- [ ] 2-3 test sellers verified
- [ ] Sample products added
- [ ] Payment flow tested (small amount)
- [ ] Mobile responsive checked
- [ ] SEO meta tags added
- [ ] Legal pages added (Terms, Privacy)
- [ ] Support email configured
- [ ] Social media links added
- [ ] Analytics tracking enabled
- [ ] Error monitoring setup
- [ ] Team notified
- [ ] Soft launch to limited users
- [ ] Monitor for 24 hours
- [ ] Public launch 🚀

---

**Congratulations!** Your Vendora marketplace is now live! 🎉
