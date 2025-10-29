# Welcome to your Lovable project

## CRITICAL: Security Setup Required

**IMPORTANT**: This project uses Supabase and requires environment variables to function. **NEVER** commit the `.env` file to version control.

### First Time Setup

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials**:
   - Log into [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Project Settings > API
   - Copy your credentials

3. **Update the .env file** with your actual Supabase credentials

4. **VERIFY** that `.env` is listed in `.gitignore` (it should be by default)

For more security information, see [SECURITY.md](./SECURITY.md)

## Project info

**URL**: https://lovable.dev/projects/3526ac6c-c105-4eb9-a710-628eea2a726e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3526ac6c-c105-4eb9-a710-628eea2a726e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Production Build & Optimization

This project includes several npm scripts for production builds and bundle analysis:

```bash
# Standard production build
npm run build

# Production build with bundle size analysis
npm run build:check

# Check bundle size of existing build
npm run build:size

# Build with asset breakdown
npm run build:analyze
```

### Build Optimizations

The project includes several production optimizations:

- **Code Splitting**: Routes are lazy-loaded for optimal initial load time
- **Vendor Chunks**: Third-party libraries are split into separate chunks for better caching
- **Minification**: JavaScript and CSS are minified using esbuild
- **Tree Shaking**: Unused code is automatically removed
- **Security Headers**: Production builds include security headers via `_headers` file (Netlify/Vercel compatible)
- **PWA Ready**: Meta tags configured for Progressive Web App support

### Security Headers

The application includes comprehensive security headers configured in `/public/_headers`:
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME-type sniffing protection)
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security

For more security information, see [SECURITY.md](./SECURITY.md)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3526ac6c-c105-4eb9-a710-628eea2a726e) and click on Share -> Publish.

### Deployment Platforms

The project is optimized for deployment on:
- **Netlify** (includes `_headers` file for security headers)
- **Vercel** (includes `_headers` file for security headers)
- **Lovable** (easiest option via Share -> Publish)

All static hosting providers should work. The `dist` folder contains the production build.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
