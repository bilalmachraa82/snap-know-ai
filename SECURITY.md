# Security Policy

## Critical Security Incident - Environment Variables Exposed

**STATUS**: Active security incident requiring immediate action.

A `.env` file containing Supabase credentials was committed to git in commit `af5e4fa`. This exposed:
- Supabase Project ID
- Supabase Publishable Key
- Supabase Project URL

## Immediate Actions Required

### 1. Rotate Supabase Keys (CRITICAL - DO THIS FIRST)

You must rotate your Supabase API keys immediately:

1. **Log into Supabase Dashboard**: https://app.supabase.com
2. **Navigate to your project**: Select the project `afnhqzwhgygyvppmqccq`
3. **Go to Project Settings**: Click on the gear icon
4. **Select API**: In the left sidebar
5. **Rotate the anon/public key**:
   - Scroll to "Project API keys"
   - Click on "Rotate" next to the `anon` key
   - Confirm the rotation
   - Copy the new key immediately

6. **Update your local .env file** with the new credentials
7. **Update production environment variables** (see below)

### 2. Check for Unauthorized Access

After rotating keys, review your Supabase project for any suspicious activity:

1. **Check Database Logs**: Project Settings > Logs
2. **Review Auth Users**: Authentication > Users (look for unexpected accounts)
3. **Check Database Activity**: Database > Logs
4. **Review API Usage**: Project Settings > Usage (look for unusual spikes)

### 3. Secure Repository History

The exposed credentials are still in git history. Consider:

1. **Private Repository**: Ensure this repository is set to private
2. **Git History Rewrite** (Optional but recommended):
   ```bash
   # WARNING: This rewrites history and will affect all collaborators
   # Only do this if you understand git history rewriting
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push to remote (requires coordination with team)
   git push origin --force --all
   ```
3. **Alternative**: If the repo is private and you've rotated keys, you may choose to leave history as-is

## Environment Variables Setup

### Local Development

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials**:
   - Log into https://app.supabase.com
   - Select your project
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key

3. **Update .env** with your actual credentials

4. **NEVER commit .env**: The `.gitignore` file now prevents this

### Production Deployment

When deploying to production (e.g., via Lovable or other hosting):

1. **Set environment variables in your hosting platform**:
   - For Lovable: Project > Settings > Environment Variables
   - For Vercel: Project Settings > Environment Variables
   - For Netlify: Site settings > Build & deploy > Environment

2. **Use these variable names**:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`

3. **Never hardcode credentials** in your source code

## Security Best Practices

### For This Project

1. **Environment Variables**:
   - Never commit `.env` files to version control
   - Always use `.env.example` with placeholder values
   - Keep production and development environments separate
   - Rotate keys regularly (every 90 days recommended)

2. **Supabase Security**:
   - Use Row Level Security (RLS) policies on all tables
   - Implement proper authentication flows
   - Never expose the `service_role` key in client-side code
   - Only use the `anon` key in frontend applications
   - Monitor API usage regularly

3. **Code Review**:
   - Review all commits for accidentally committed secrets
   - Use git hooks to prevent committing sensitive files
   - Consider using tools like `git-secrets` or `trufflehog`

4. **Access Control**:
   - Limit repository access to necessary team members
   - Use branch protection rules
   - Require code reviews before merging

### General Security Guidelines

1. **Keep dependencies updated**: Run `npm audit` regularly
2. **Use HTTPS**: Always use secure connections
3. **Validate user input**: Sanitize and validate all user inputs
4. **Implement proper authentication**: Use secure authentication methods
5. **Enable 2FA**: Use two-factor authentication on all accounts

## Reporting Security Issues

If you discover a security vulnerability in this project:

1. **DO NOT** open a public issue
2. Contact the project maintainer directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/securing-your-repository)

## Changelog

- **2025-10-29**: Initial security incident response - .env file exposed in commit af5e4fa
  - Added `.env` to `.gitignore`
  - Created `.env.example`
  - Created this SECURITY.md document
  - Updated README.md with security warnings
