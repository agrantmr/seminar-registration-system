# Useful Commands Reference

Quick reference for common tasks and commands.

## Setup Commands

### Install Dependencies
```bash
npm install
```

### Generate Password Hash
```bash
npm run generate-hash "your-password-here"
# or
node scripts/generate-password-hash.js "your-password-here"
```

### Generate Random Secrets
```bash
# For CRON_SECRET and JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development Commands

### Start Local Development Server
```bash
npm run dev
# or
vercel dev
```

Access at: `http://localhost:3000`

### Pull Environment Variables
```bash
vercel env pull .env.local
```

### Link Local Project to Vercel
```bash
vercel link
```

## Deployment Commands

### Deploy to Preview
```bash
vercel
```

### Deploy to Production
```bash
npm run deploy
# or
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

## Logging & Debugging

### Stream Live Logs
```bash
npm run logs
# or
vercel logs --follow
```

### View Logs for Specific Function
```bash
vercel logs --follow api/register
```

### View Recent Logs
```bash
vercel logs
```

## Database Commands

### Connect to Database (psql)
```bash
# First, get connection string
vercel env pull .env.local

# Then connect
psql $POSTGRES_URL
```

### Run SQL Query
```sql
-- View all registrations
SELECT * FROM registrations ORDER BY registered_at DESC;

-- Count registrations
SELECT COUNT(*) FROM registrations;

-- View recent registrations
SELECT first_name, email, registered_at
FROM registrations
ORDER BY registered_at DESC
LIMIT 10;

-- Check email delivery status
SELECT
  confirmation_sent,
  COUNT(*) as count
FROM registrations
GROUP BY confirmation_sent;

-- Find registrations without confirmations
SELECT first_name, email
FROM registrations
WHERE confirmation_sent = false;

-- Delete test registrations (BE CAREFUL!)
DELETE FROM registrations
WHERE email LIKE '%test%';
```

### Backup Database
```bash
# Export to SQL file
pg_dump $POSTGRES_URL > backup.sql

# Restore from backup
psql $POSTGRES_URL < backup.sql
```

## Testing API Endpoints

### Test Seat Count
```bash
curl https://your-domain.vercel.app/api/seats
```

### Test Registration
```bash
curl -X POST https://your-domain.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test User",
    "email": "test@example.com"
  }'
```

### Test Admin Login
```bash
curl -X POST https://your-domain.vercel.app/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your-admin-password"
  }'
```

### Test Admin Endpoints (with JWT)
```bash
# First, get token from login response
TOKEN="your-jwt-token-here"

# List registrations
curl https://your-domain.vercel.app/api/admin/registrations \
  -H "Authorization: Bearer $TOKEN"

# Export CSV
curl https://your-domain.vercel.app/api/admin/export \
  -H "Authorization: Bearer $TOKEN" \
  -o registrations.csv
```

### Test Cron Jobs
```bash
CRON_SECRET="your-cron-secret"

# Test week reminder
curl https://your-domain.vercel.app/api/cron/send-week-reminder \
  -H "Authorization: Bearer $CRON_SECRET"

# Test day reminder
curl https://your-domain.vercel.app/api/cron/send-day-reminder \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Environment Variable Commands

### List All Environment Variables
```bash
vercel env ls
```

### Add Environment Variable
```bash
vercel env add VARIABLE_NAME
```

### Remove Environment Variable
```bash
vercel env rm VARIABLE_NAME
```

### Pull Environment Variables to Local
```bash
vercel env pull .env.local
```

## Project Management

### View Project Info
```bash
vercel inspect
```

### List All Deployments
```bash
vercel ls
```

### Remove Old Deployment
```bash
vercel rm deployment-url
```

### View Project Settings
```bash
vercel project ls
```

## Domain Commands

### Add Domain
```bash
vercel domains add yourdomain.com
```

### List Domains
```bash
vercel domains ls
```

### Remove Domain
```bash
vercel domains rm yourdomain.com
```

## Git Commands

### Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### Connect to GitHub
```bash
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
git push
```

## Database Maintenance

### Check Database Size
```sql
SELECT
  pg_size_pretty(pg_database_size(current_database())) as db_size;
```

### Check Table Size
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('registrations')) as table_size;
```

### View Active Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Vacuum Database (cleanup)
```sql
VACUUM ANALYZE registrations;
```

## Email Testing

### Test Email with Resend CLI (if installed)
```bash
# Install Resend CLI
npm install -g resend

# Send test email
resend emails send \
  --from "noreply@yourdomain.com" \
  --to "your@email.com" \
  --subject "Test Email" \
  --html "<p>Test</p>"
```

### Check Email Logs (Resend Dashboard)
```bash
# Open Resend dashboard
open https://resend.com/emails
```

## Performance Testing

### Simple Load Test with curl
```bash
# Run 100 concurrent requests
for i in {1..100}; do
  curl https://your-domain.vercel.app/api/seats &
done
wait
```

### Using Apache Bench (ab)
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 https://your-domain.vercel.app/api/seats
```

### Using wrk (advanced)
```bash
# 30 second test with 10 connections
wrk -t10 -c10 -d30s https://your-domain.vercel.app/api/seats
```

## Useful One-Liners

### Count Total Registrations
```bash
psql $POSTGRES_URL -c "SELECT COUNT(*) FROM registrations;"
```

### Export Registrations to CSV
```bash
psql $POSTGRES_URL -c "COPY registrations TO STDOUT WITH CSV HEADER" > registrations.csv
```

### Check Last 5 Registrations
```bash
psql $POSTGRES_URL -c "SELECT first_name, email, registered_at FROM registrations ORDER BY registered_at DESC LIMIT 5;"
```

### Get Current Seat Count
```bash
curl -s https://your-domain.vercel.app/api/seats | jq
```

### Test Email Deliverability
```bash
# Send to mail-tester.com
curl -X POST https://your-domain.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "email": "test-xxxxx@mail-tester.com"
  }'
```

## Troubleshooting Commands

### Check Function Status
```bash
vercel inspect api/register
```

### View Function Source
```bash
vercel inspect api/register --source
```

### Check Build Logs
```bash
vercel logs --follow --all
```

### Clear Vercel Cache
```bash
vercel deploy --force
```

### Test Database Connection
```bash
psql $POSTGRES_URL -c "SELECT version();"
```

## Security Commands

### Check for Vulnerabilities
```bash
npm audit
```

### Fix Vulnerabilities
```bash
npm audit fix
```

### Update Dependencies
```bash
npm update
```

## Cleanup Commands

### Delete All Test Registrations
```sql
DELETE FROM registrations WHERE email LIKE '%test%';
```

### Reset Database (CAREFUL!)
```sql
TRUNCATE TABLE registrations RESTART IDENTITY;
```

### Clear All Registrations (DANGEROUS!)
```sql
DELETE FROM registrations;
```

## Monitoring Commands

### Check Vercel Status
```bash
curl https://vercel-status.com/api/v2/status.json | jq
```

### Monitor Database Connections
```sql
SELECT
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections
FROM pg_stat_activity;
```

### Check Email Queue (Resend)
```bash
# Via Resend API (requires API key)
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

## Backup & Recovery

### Backup Entire Project
```bash
# Create backup directory
mkdir backup-$(date +%Y%m%d)

# Backup code
cp -r . backup-$(date +%Y%m%d)/

# Backup database
pg_dump $POSTGRES_URL > backup-$(date +%Y%m%d)/database.sql

# Backup environment variables
vercel env pull backup-$(date +%Y%m%d)/.env.backup
```

### Restore from Backup
```bash
# Restore database
psql $POSTGRES_URL < backup-20260315/database.sql

# Restore code (copy files back)
cp -r backup-20260315/* .

# Redeploy
vercel --prod
```

## Quick Reference

### Common File Paths
```
Registration Page:     /public/index.html
Admin Dashboard:       /public/admin.html
Registration API:      /api/register.js
Database Helpers:      /lib/db.js
Email Templates:       /emails/*.html
Environment Example:   /.env.example
Schema:                /schema.sql
```

### Important URLs
```
Production Site:       https://your-domain.vercel.app
Admin Dashboard:       https://your-domain.vercel.app/admin.html
Vercel Dashboard:      https://vercel.com/dashboard
Resend Dashboard:      https://resend.com/emails
```

### Emergency Contacts
```
Vercel Support:        https://vercel.com/support
Resend Support:        support@resend.com
Documentation:         See README.md
```

## Tips & Best Practices

### 1. Always Test Locally First
```bash
vercel dev
# Test changes before deploying to production
```

### 2. Use Environment Variables
```bash
# Never hardcode secrets in code
# Always use process.env.VARIABLE_NAME
```

### 3. Monitor Logs Regularly
```bash
# Check logs daily during active registration period
vercel logs --follow
```

### 4. Backup Before Major Changes
```bash
# Always backup database before making changes
pg_dump $POSTGRES_URL > backup-before-change.sql
```

### 5. Test Emails Before Launch
```bash
# Send test registrations to yourself
# Verify all email templates work
```

### 6. Keep Dependencies Updated
```bash
# Check for updates regularly
npm outdated

# Update with caution
npm update
```

### 7. Document Custom Changes
```bash
# If you modify the code, document in git commits
git commit -m "Clear description of what changed and why"
```

## Keyboard Shortcuts (Vercel Dashboard)

- `Cmd/Ctrl + K`: Quick search
- `G + D`: Go to deployments
- `G + P`: Go to project settings
- `G + S`: Go to storage

## Common Issues & Quick Fixes

### Issue: "Database connection failed"
```bash
# Check connection string
echo $POSTGRES_URL

# Test connection
psql $POSTGRES_URL -c "SELECT 1;"
```

### Issue: "Emails not sending"
```bash
# Check Resend API key
vercel env ls | grep RESEND

# Test Resend API
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your@email.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

### Issue: "Admin login not working"
```bash
# Regenerate password hash
npm run generate-hash "new-password"

# Update environment variable
vercel env add ADMIN_PASSWORD_HASH
```

### Issue: "Seat counter stuck"
```bash
# Check API endpoint
curl https://your-domain.vercel.app/api/seats

# Check database count
psql $POSTGRES_URL -c "SELECT COUNT(*) FROM registrations;"
```

---

**Save this file for quick reference during development and operation!** 📚
