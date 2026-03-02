# Deployment Guide

Step-by-step instructions to deploy the seminar registration system to Vercel.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Vercel CLI](https://vercel.com/cli) installed (`npm i -g vercel`)
- [Vercel Account](https://vercel.com/signup)
- [Resend Account](https://resend.com/signup)

## Step 1: Install Dependencies

```bash
cd /mnt/c/seminar
npm install
```

## Step 2: Set Up Resend Email

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Create an API key
4. Copy the API key (starts with `re_...`)

## Step 3: Generate Admin Password Hash

```bash
node scripts/generate-password-hash.js "YourSecurePasswordHere"
```

Copy the generated hash (starts with `$2b$10$...`)

## Step 4: Create Vercel Project

```bash
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? Select your account
- Link to existing project? `N`
- Project name? `seminar-registration` (or your choice)
- Directory? `./`
- Override settings? `N`

This creates a development deployment.

## Step 5: Create Vercel Postgres Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a name (e.g., `seminar-db`)
7. Select region closest to your users
8. Click "Create"

## Step 6: Connect Database to Project

1. In the Storage tab, click your database
2. Click "Connect Project"
3. Select your seminar project
4. Click "Connect"

This automatically adds `POSTGRES_URL` and related environment variables to your project.

## Step 7: Run Database Schema

1. In Vercel dashboard, go to your database
2. Click "Query" tab
3. Copy the contents of `schema.sql`
4. Paste and run the query

Alternatively, use the Vercel CLI:

```bash
vercel env pull .env.local
psql $POSTGRES_URL < schema.sql
```

## Step 8: Configure Environment Variables

Go to your Vercel project settings → Environment Variables and add:

### Required Variables

```bash
# Email (from Resend)
RESEND_API_KEY="re_your_key_here"
EMAIL_FROM="noreply@yourdomain.com"

# Admin (from Step 3)
ADMIN_PASSWORD_HASH="$2b$10$your_hash_here"

# Event Configuration
EVENT_DATE="2026-04-15T22:00:00Z"
EVENT_TIME="7:00 PM - 8:30 PM"
EVENT_LOCATION="Community Hall, Main Street, Your Town"
TOTAL_SEATS="40"

# Security (generate random strings)
CRON_SECRET="your-random-secure-string-32chars"
JWT_SECRET="another-random-secure-string-32chars"
```

### Generate Random Secrets

```bash
# For CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Important Notes

- **EVENT_DATE**: Must be in ISO 8601 format with timezone (UTC recommended)
  - Example: `2026-04-15T22:00:00Z` = April 15, 2026 at 10:00 PM UTC
  - Convert your local time to UTC
- **EMAIL_FROM**: Use a verified domain in Resend
  - For testing, you can use Resend's test domain: `onboarding@resend.dev`
- **Secrets**: Should be 32+ character random strings

## Step 9: Deploy to Production

```bash
vercel --prod
```

This deploys your site to production. You'll get a URL like `https://seminar-registration.vercel.app`

## Step 10: Verify Deployment

### Test Registration Page
1. Visit your production URL
2. Check that the seat counter loads
3. Try registering with your email
4. Verify you receive a confirmation email

### Test Admin Dashboard
1. Visit `https://your-url.vercel.app/admin.html`
2. Login with your admin password
3. Verify you can see registrations
4. Test CSV export

### Verify Cron Jobs
1. Go to Vercel dashboard → Your Project
2. Click "Settings" → "Cron Jobs"
3. You should see two cron jobs listed:
   - `/api/cron/send-week-reminder` (0 9 * * *)
   - `/api/cron/send-day-reminder` (0 9 * * *)

### Test Cron Jobs Manually

```bash
curl -X GET https://your-url.vercel.app/api/cron/send-week-reminder \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Step 11: Configure Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (can take 24-48 hours)

## Step 12: Set Up Email Domain (Recommended)

For better email deliverability:

1. In Resend dashboard, add your domain
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain
4. Update `EMAIL_FROM` environment variable to use your domain

## Testing Checklist

After deployment, test these scenarios:

- [ ] Registration form loads correctly
- [ ] Seat counter shows accurate count
- [ ] Valid registration succeeds
- [ ] Confirmation email is received
- [ ] Duplicate email is rejected
- [ ] Invalid email format is rejected
- [ ] Event full message appears at 40 registrations
- [ ] Admin login works
- [ ] Admin dashboard shows registrations
- [ ] CSV export downloads
- [ ] Cron jobs can be triggered manually

## Monitoring

### Check Function Logs

```bash
vercel logs --follow
```

Or view logs in Vercel Dashboard → Your Project → Deployments → [Latest] → Functions

### Monitor Email Delivery

1. Go to [resend.com/emails](https://resend.com/emails)
2. View email delivery status
3. Check for bounces or spam reports

### Database Usage

1. Go to Vercel Dashboard → Storage → Your Database
2. Check storage usage (free tier: 256MB)
3. Monitor connection count

## Troubleshooting

### Problem: Emails not being received

**Solution:**
1. Check Resend dashboard for delivery status
2. Verify `EMAIL_FROM` address
3. Check spam folder
4. Verify domain is set up correctly in Resend

### Problem: Database connection errors

**Solution:**
1. Verify `POSTGRES_URL` is set in environment variables
2. Check that database schema was created
3. Review function logs for specific errors

### Problem: Cron jobs not running

**Solution:**
1. Verify cron jobs are listed in Vercel dashboard
2. Check `CRON_SECRET` is set correctly
3. Review function logs at 9 AM UTC
4. Test manually with curl command

### Problem: Rate limiting too strict

**Solution:**
- Current limit: 3 attempts per hour per IP
- Adjust in `lib/utils.js` → `checkRateLimit` function
- Redeploy with `vercel --prod`

## Post-Deployment

### Update Event Details

To change event date/time/location without redeploying:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the relevant variables
3. Click "Save"
4. Trigger a redeploy (or wait for next deployment)

### Monitor Registrations

- Check admin dashboard regularly
- Download CSV backups periodically
- Monitor email delivery in Resend

### Before Event Day

1. Export final registration list
2. Verify all reminder emails were sent
3. Check admin dashboard for total count

## Scaling Beyond Free Tier

If you exceed free tier limits:

- **Vercel Functions**: Upgrade to Pro ($20/month)
- **Vercel Postgres**: Upgrade for more storage
- **Resend**: Upgrade for more emails ($20/month for 50k emails)

Current free tier limits:
- Vercel: 100GB bandwidth, 100 hours function execution
- Postgres: 256MB storage, 60 hours compute
- Resend: 3,000 emails/month

For a 40-seat event with 2 reminders each:
- Total emails: ~120 (well within free tier)

## Support

For issues:
1. Check Vercel function logs
2. Review Resend email logs
3. Check database connection in Vercel dashboard

## Security Reminders

- [ ] Strong admin password set
- [ ] Secure random strings for JWT_SECRET and CRON_SECRET
- [ ] Environment variables set in Vercel (not in code)
- [ ] Database accessible only via Vercel functions
- [ ] HTTPS enabled (automatic with Vercel)

---

**Deployment complete!** 🎉

Your seminar registration system is now live and ready to accept registrations.
