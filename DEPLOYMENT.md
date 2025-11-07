# Deployment Guide - Cal AI

This guide explains how to deploy Cal AI to Netlify and other hosting platforms.

## Table of Contents
- [Netlify Deployment](#netlify-deployment)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [CI/CD Setup](#cicd-setup)
- [Troubleshooting](#troubleshooting)

## Netlify Deployment

### Prerequisites
- Node.js 20 or higher
- npm installed
- Git repository
- Netlify account (free tier works)
- Supabase project with credentials

### Quick Start - Deploy to Netlify

#### Option 1: Deploy via Netlify UI (Recommended for first deployment)

1. **Fork/Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd snap-know-ai
   ```

2. **Push to GitHub** (if not already there)
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Netlify will auto-detect the build settings from `netlify.toml`

4. **Configure Environment Variables** (Critical!)
   - In Netlify dashboard, go to: Site settings → Environment variables
   - Add the following variables:
     ```
     VITE_SUPABASE_PROJECT_ID=your-project-id
     VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     ```
   - Get these values from your Supabase dashboard (see [Environment Variables](#environment-variables))

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (usually 2-3 minutes)
   - Your site will be live at `https://<random-name>.netlify.app`

#### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Follow prompts to create new site or link existing one
   - Netlify will detect `netlify.toml` configuration

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_SUPABASE_PROJECT_ID "your-project-id"
   netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "your-publishable-key"
   netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
   ```

5. **Deploy**
   ```bash
   # Deploy to production
   netlify deploy --prod

   # Or deploy to preview first
   netlify deploy
   ```

### Build Configuration

The project includes a `netlify.toml` file that configures:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 20
- **SPA routing**: All routes redirect to `index.html`
- **Security headers**: Applied automatically
- **Cache headers**: Optimized for static assets

You can modify these settings in `/home/user/snap-know-ai/netlify.toml`

## Environment Variables

### Required Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend.

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | Supabase Dashboard → Settings → General → Reference ID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API → Project API keys → anon public |
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |

### How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Navigate to **Project Settings** (gear icon)
4. Go to **API** section
5. Copy the following:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Go to **General** section
   - **Reference ID** → Use for `VITE_SUPABASE_PROJECT_ID`

### Setting Environment Variables in Netlify

#### Via Netlify UI:
1. Go to your site dashboard
2. Site settings → Environment variables
3. Click "Add a variable"
4. Enter key and value
5. Select scope (usually "Same value for all deploy contexts")
6. Click "Create variable"

#### Via Netlify CLI:
```bash
netlify env:set VARIABLE_NAME "value"
```

#### Via `netlify.toml` (Not recommended for secrets):
```toml
[build.environment]
  VITE_PUBLIC_VAR = "public_value"
```

Note: Never commit secrets to `netlify.toml`. Use the UI or CLI for sensitive values.

## Custom Domain Setup

### Add Custom Domain to Netlify

1. **Purchase Domain** (if you don't have one)
   - Recommended: Namecheap, Google Domains, Cloudflare

2. **Add Domain in Netlify**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `calai.com`)
   - Click "Verify"

3. **Configure DNS**

   **Option A: Use Netlify DNS (Recommended)**
   - Netlify will provide nameservers
   - Update nameservers in your domain registrar
   - Netlify handles everything (SSL, redirects, etc.)

   **Option B: Use External DNS**
   - Add A record: `104.198.14.52` (Netlify load balancer)
   - Add CNAME for www: `<your-site>.netlify.app`
   - Or use CNAME flattening if available

4. **Enable HTTPS**
   - Netlify automatically provisions SSL via Let's Encrypt
   - Usually takes 1-2 minutes after DNS propagates
   - Enable "Force HTTPS" in domain settings

5. **Test**
   ```bash
   curl -I https://yourdomain.com
   # Should return 200 OK with security headers
   ```

## Supabase Integration

### Verify Supabase Setup

1. **Check Supabase Project Status**
   - Ensure project is active and not paused
   - Verify database tables exist (waitlist, etc.)

2. **Test API Connection**
   ```bash
   # Test from your deployed site's console
   const { data, error } = await supabase.from('waitlist').select('count');
   console.log(data, error);
   ```

3. **Configure CORS** (if needed)
   - Go to Supabase Dashboard → Settings → API
   - Add your Netlify domain to allowed origins
   - Default allows all origins (*)

### Row Level Security (RLS)

Ensure your Supabase tables have proper RLS policies:

```sql
-- Example: Allow public to insert into waitlist
CREATE POLICY "Allow public inserts"
ON waitlist
FOR INSERT
TO anon
WITH CHECK (true);

-- Example: Only authenticated users can read
CREATE POLICY "Allow authenticated reads"
ON waitlist
FOR SELECT
TO authenticated
USING (true);
```

## CI/CD Setup

### GitHub Actions (Recommended)

The project includes a GitHub Actions workflow for automated deployments.

**Workflow file**: `/home/user/snap-know-ai/.github/workflows/netlify-deploy.yml`

**Setup Instructions**:

1. **Add GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add the following secrets:
     ```
     NETLIFY_AUTH_TOKEN=<your-netlify-auth-token>
     NETLIFY_SITE_ID=<your-netlify-site-id>
     VITE_SUPABASE_PROJECT_ID=<your-project-id>
     VITE_SUPABASE_PUBLISHABLE_KEY=<your-key>
     VITE_SUPABASE_URL=<your-url>
     ```

2. **Get Netlify Credentials**
   - **Auth Token**: Netlify Dashboard → User settings → Applications → Personal access tokens → "New access token"
   - **Site ID**: Site settings → General → Site details → Site ID

3. **How It Works**
   - **Pull Requests**: Creates preview deployment, runs tests
   - **Push to main**: Deploys to production
   - **Manual trigger**: Can trigger via GitHub Actions tab

### Automatic Deployments from Git

Netlify automatically deploys when you push to your repository:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches
- **Branch previews**: Each branch gets unique URL

**Configure in Netlify**:
- Build & deploy → Continuous deployment
- Set branch to deploy: `main`
- Enable deploy previews for PRs

## Testing Deployment

### Pre-Deployment Checklist

Before deploying to production:

```bash
# 1. Test build locally
npm run build

# 2. Preview build locally
npx serve dist

# 3. Verify routes work
# Open browser: http://localhost:3000
# Test navigation to different routes
# Refresh page on a route (should not 404)

# 4. Check bundle size
npm run build:size

# 5. Test Supabase connection
# Open browser console and test API calls
```

### Post-Deployment Verification

After deployment:

1. **Test All Routes**
   - Home: `/`
   - Dashboard: `/dashboard`
   - Meals: `/meals`
   - Analytics: `/analytics`
   - Settings: `/settings`

2. **Test Functionality**
   - Waitlist form submission
   - Image upload (if applicable)
   - Data persistence
   - Authentication (if applicable)

3. **Verify Security Headers**
   ```bash
   curl -I https://yourdomain.com | grep -E "(X-|Content-Security|Referrer)"
   ```

4. **Check Performance**
   - Use Lighthouse (Chrome DevTools)
   - Target: 90+ performance score
   - Verify assets are cached properly

5. **Monitor Logs**
   - Netlify: Site → Deploys → [Latest deploy] → Deploy log
   - Browser console: Check for errors
   - Supabase: Logs & Analytics

## Troubleshooting

### Common Issues

#### 1. Build Fails - "Command failed with exit code 1"

**Cause**: Missing dependencies or build errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build
```

#### 2. "Page Not Found" on Routes

**Cause**: SPA routing not configured

**Solution**:
- Verify `netlify.toml` exists with redirects
- Verify `public/_redirects` exists
- Check deploy log to ensure files are included

#### 3. Environment Variables Not Working

**Cause**: Variables not set in Netlify or wrong prefix

**Solution**:
- Ensure all variables start with `VITE_`
- Set variables in Netlify UI (not in code)
- Trigger new deploy after adding variables
- Check build log to see if variables are loaded

#### 4. Supabase Connection Fails

**Cause**: Wrong credentials or CORS issues

**Solution**:
```bash
# Verify variables in Netlify
netlify env:list

# Test Supabase URL
curl https://your-project-id.supabase.co/rest/v1/

# Check Supabase project is active (not paused)
```

#### 5. Security Headers Not Applied

**Cause**: `_headers` file not in build output

**Solution**:
- Verify `public/_headers` exists
- Check `netlify.toml` headers configuration
- Use browser DevTools Network tab to inspect headers

#### 6. Slow Build Times

**Cause**: Large dependencies or no caching

**Solution**:
- Enable build cache in Netlify settings
- Review dependency size: `npm run build:analyze`
- Consider lazy loading heavy components

### Getting Help

- **Netlify Support**: https://answers.netlify.com
- **Supabase Support**: https://github.com/supabase/supabase/discussions
- **Project Issues**: Create issue in GitHub repository

## Performance Optimization

### Build Optimizations

The project includes:
- Code splitting by route
- Vendor chunk separation
- Minification (JS, CSS)
- Tree shaking
- Image optimization

### Caching Strategy

Configured in `netlify.toml`:
- Static assets (JS, CSS, fonts, images): 1 year cache
- HTML: No cache (always fresh)
- Service worker: No cache

### Monitoring

1. **Netlify Analytics**
   - Enable in Site settings → Analytics
   - Track page views, load times, bandwidth

2. **Supabase Analytics**
   - Monitor API usage
   - Track database performance
   - Review logs for errors

3. **Web Vitals**
   - Use Lighthouse CI
   - Monitor Core Web Vitals
   - Set up alerts for regressions

## Alternative Platforms

### Vercel

Similar to Netlify, auto-detects Vite:
```bash
npm i -g vercel
vercel
```

### Cloudflare Pages

```bash
# Build command
npm run build

# Build output directory
dist
```

### AWS Amplify

- Connect GitHub repository
- Configure build: `npm run build`
- Output: `dist`
- Add environment variables

## Security Best Practices

1. **Never commit `.env` file**
   - Always in `.gitignore`
   - Use platform environment variables

2. **Use HTTPS only**
   - Enable "Force HTTPS" in Netlify
   - HSTS header enabled in `netlify.toml`

3. **Review security headers**
   - CSP (Content Security Policy)
   - X-Frame-Options
   - X-Content-Type-Options

4. **Supabase RLS**
   - Enable Row Level Security on all tables
   - Test policies thoroughly

5. **Monitor logs**
   - Check for suspicious activity
   - Set up error alerts

## Cost Estimation

### Netlify Free Tier
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS included

### Netlify Pro ($19/month)
- 400 GB bandwidth
- 1000 build minutes
- Background functions
- Analytics

### Supabase Free Tier
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth

### Estimated Monthly Cost
- Small app (< 10k users): $0 (free tiers)
- Medium app (10k-50k users): $19-50
- Large app (50k+ users): $100+

## Next Steps

After deployment:

1. Set up custom domain
2. Enable Netlify Analytics (optional)
3. Configure monitoring and alerts
4. Set up staging environment
5. Document API endpoints
6. Create runbook for incidents
7. Plan scaling strategy

## Support

For deployment support:
- Open issue in GitHub repository
- Check [Netlify docs](https://docs.netlify.com)
- Check [Supabase docs](https://supabase.com/docs)
