# Quick Start Guide

Get your seminar registration system up and running in 10 minutes.

## Prerequisites

- Node.js installed
- Vercel account
- Resend account

## Step-by-Step Setup

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Get Resend API Key (2 minutes)

1. Go to [resend.com](https://resend.com)
2. Sign up or login
3. Create API key
4. Copy the key (starts with `re_`)

### 3. Generate Admin Password (30 seconds)

```bash
node scripts/generate-password-hash.js "your-password-here"
```

Copy the hash that's printed.

### 4. Deploy to Vercel (2 minutes)

```bash
npm install -g vercel  # if not already installed
vercel
```

Follow the prompts to create a new project.

### 5. Create Database (2 minutes)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open your project
3. Go to "Storage" → "Create Database" → "Postgres"
4. Name it and create
5. Click "Connect Project" → Select your project

### 6. Run Database Schema (1 minute)

In Vercel dashboard:
1. Go to your database → "Query" tab
2. Copy contents of `schema.sql`
3. Paste and execute

### 7. Set Environment Variables (3 minutes)

In Vercel project settings → Environment Variables, add:

```bash
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=onboarding@resend.dev
ADMIN_PASSWORD_HASH=$2b$10$your_hash_here
EVENT_DATE=2026-04-15T22:00:00Z
EVENT_TIME=7:00 PM - 8:30 PM
EVENT_LOCATION=Community Hall, Main St
TOTAL_SEATS=40
CRON_SECRET=random-string-here
JWT_SECRET=another-random-string-here
```

Generate random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 8. Deploy to Production (1 minute)

```bash
vercel --prod
```

### 9. Test It! (1 minute)

1. Visit your URL (shown after deployment)
2. Register with your email
3. Check your inbox for confirmation
4. Visit `/admin.html` and login

## Done! 🎉

Your registration system is live!

## Next Steps

- [ ] Add a custom domain
- [ ] Verify email domain in Resend for better deliverability
- [ ] Test admin dashboard
- [ ] Share registration link

## Common Issues

**Emails not received?**
- Check spam folder
- Verify `EMAIL_FROM` in environment variables
- Check Resend dashboard for delivery status

**Can't login to admin?**
- Verify `ADMIN_PASSWORD_HASH` is set correctly
- Try regenerating the hash

**Database errors?**
- Verify database is connected to project
- Check that schema was run successfully

## Need Help?

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for troubleshooting
- Review Vercel function logs

---

**Ready to promote your seminar!** Share your registration link and watch the registrations roll in.
