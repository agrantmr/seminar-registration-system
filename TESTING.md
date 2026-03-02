# Testing Guide

Comprehensive testing checklist for the seminar registration system.

## Pre-Deployment Testing (Local)

### 1. Install and Setup

```bash
npm install
vercel env pull .env.local  # Pull environment variables from Vercel
vercel dev                   # Start local development server
```

Visit: `http://localhost:3000`

### 2. Registration Flow Tests

#### Test 1: Valid Registration
- [ ] Fill in first name: "John"
- [ ] Fill in email: "john@example.com"
- [ ] Click "Register Now"
- [ ] Expect: Success message appears
- [ ] Expect: Confirmation email received
- [ ] Expect: Seat counter updates

#### Test 2: Duplicate Email
- [ ] Try to register "john@example.com" again
- [ ] Expect: Error message "This email is already registered"

#### Test 3: Invalid Email
- [ ] Try email: "notanemail"
- [ ] Expect: Validation error

#### Test 4: Empty Fields
- [ ] Leave first name empty
- [ ] Expect: Validation error
- [ ] Leave email empty
- [ ] Expect: Validation error

#### Test 5: Name Sanitization
- [ ] Try name: "John<script>alert('xss')</script>"
- [ ] Expect: Script tags removed, name saved as "John"

#### Test 6: Rate Limiting
- [ ] Register 3 times with different emails quickly
- [ ] Expect: First 3 succeed
- [ ] Try 4th registration
- [ ] Expect: Rate limit error message

### 3. Seat Counter Tests

#### Test 1: Initial Display
- [ ] Page loads with seat counter visible
- [ ] Shows "Hurry! Limited seats available." when >11 seats remain

#### Test 2: Low Seats Warning
- [ ] Create 29+ registrations (leaving ≤11 seats)
- [ ] Expect: "Only X seats left out of 40!"

#### Test 3: Event Full
- [ ] Create 40 registrations
- [ ] Expect: "Event Full!" message
- [ ] Expect: Register button disabled

#### Test 4: Auto-refresh
- [ ] Open page in two browser windows
- [ ] Register in one window
- [ ] Expect: Counter updates in other window within 30 seconds

### 4. Admin Dashboard Tests

Visit: `http://localhost:3000/admin.html`

#### Test 1: Login with Wrong Password
- [ ] Enter incorrect password
- [ ] Expect: Error message "Invalid password"

#### Test 2: Login with Correct Password
- [ ] Enter correct admin password
- [ ] Expect: Dashboard appears
- [ ] Expect: Stats show correct counts

#### Test 3: View Registrations
- [ ] Verify all registrations appear in table
- [ ] Verify columns show correct data
- [ ] Check confirmation status badges

#### Test 4: Refresh Data
- [ ] Click "Refresh" button
- [ ] Expect: Table reloads with latest data

#### Test 5: Export CSV
- [ ] Click "Export CSV" button
- [ ] Expect: CSV file downloads
- [ ] Open CSV and verify data is correct

#### Test 6: JWT Expiration
- [ ] Login and save token
- [ ] Wait 24+ hours (or manually test with expired token)
- [ ] Expect: Auto-logout and redirect to login

#### Test 7: Logout
- [ ] Click "Logout" button
- [ ] Expect: Return to login screen
- [ ] Expect: Token cleared from localStorage

### 5. API Endpoint Tests

Use curl or Postman to test:

#### GET /api/seats
```bash
curl http://localhost:3000/api/seats
```
Expected response:
```json
{
  "totalSeats": 40,
  "registeredSeats": 5,
  "availableSeats": 35
}
```

#### POST /api/register
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"test@example.com"}'
```
Expected response:
```json
{
  "success": true,
  "message": "Registration successful! Check your email for confirmation.",
  "seatsRemaining": 34
}
```

#### POST /api/admin/auth
```bash
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```
Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/admin/registrations
```bash
curl http://localhost:3000/api/admin/registrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /api/cron/send-week-reminder
```bash
curl http://localhost:3000/api/cron/send-week-reminder \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 6. Email Tests

#### Test 1: Confirmation Email
- [ ] Register a new user
- [ ] Check email inbox
- [ ] Verify email received
- [ ] Verify name is personalized
- [ ] Verify event details are correct
- [ ] Check email formatting (HTML renders correctly)

#### Test 2: Week Reminder Email
- [ ] Manually call `/api/cron/send-week-reminder`
- [ ] Adjust EVENT_DATE to be 7 days from today
- [ ] Call cron endpoint
- [ ] Verify reminder emails sent

#### Test 3: Day Reminder Email
- [ ] Adjust EVENT_DATE to be 1 day from tomorrow
- [ ] Call `/api/cron/send-day-reminder`
- [ ] Verify reminder emails sent

#### Test 4: Email Deliverability
- [ ] Test with Gmail
- [ ] Test with Outlook
- [ ] Test with Yahoo
- [ ] Check spam folders
- [ ] Verify sender name appears correctly

### 7. Database Tests

Connect to your database and verify:

#### Test 1: Registration Inserted
```sql
SELECT * FROM registrations WHERE email = 'test@example.com';
```
- [ ] Verify record exists
- [ ] Verify email is lowercase
- [ ] Verify timestamp is correct

#### Test 2: Duplicate Email Constraint
```sql
INSERT INTO registrations (first_name, email)
VALUES ('Test', 'duplicate@example.com');

-- Try again (should fail)
INSERT INTO registrations (first_name, email)
VALUES ('Test2', 'duplicate@example.com');
```
- [ ] Expect: Second insert fails with unique constraint error

#### Test 3: Email Flags
```sql
SELECT confirmation_sent, week_reminder_sent, day_reminder_sent
FROM registrations WHERE email = 'test@example.com';
```
- [ ] Verify flags update after emails sent

### 8. Security Tests

#### Test 1: SQL Injection
Try registering with:
- Email: `test@example.com'; DROP TABLE registrations; --`
- [ ] Expect: Safe handling, no SQL execution

#### Test 2: XSS Prevention
Try name:
- `<script>alert('XSS')</script>`
- `<img src=x onerror=alert('XSS')>`
- [ ] Expect: Tags removed/escaped

#### Test 3: Unauthorized Admin Access
```bash
curl http://localhost:3000/api/admin/registrations
```
- [ ] Expect: 401 Unauthorized (no token)

```bash
curl http://localhost:3000/api/admin/registrations \
  -H "Authorization: Bearer invalid-token"
```
- [ ] Expect: 401 Unauthorized (invalid token)

#### Test 4: Cron Security
```bash
curl http://localhost:3000/api/cron/send-week-reminder
```
- [ ] Expect: 401 Unauthorized (no secret)

```bash
curl http://localhost:3000/api/cron/send-week-reminder \
  -H "Authorization: Bearer wrong-secret"
```
- [ ] Expect: 401 Unauthorized (wrong secret)

### 9. Race Condition Tests

#### Test 1: Concurrent Registrations at Seat Limit
- [ ] Set TOTAL_SEATS to 3 (for easier testing)
- [ ] Create 2 registrations
- [ ] Simultaneously submit 5 registration requests
- [ ] Expect: Only 1 succeeds (reaches limit of 3)
- [ ] Expect: Others get "Event is full" error
- [ ] Verify database has exactly 3 records

Use this script for concurrent testing:
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/register \
    -H "Content-Type: application/json" \
    -d "{\"firstName\":\"Test$i\",\"email\":\"test$i@example.com\"}" &
done
wait
```

## Post-Deployment Testing (Production)

After deploying to Vercel:

### 1. Smoke Tests
- [ ] Visit production URL
- [ ] Verify page loads correctly
- [ ] Verify seat counter works
- [ ] Test one registration
- [ ] Test admin login

### 2. Vercel-Specific Tests

#### Test 1: Function Logs
```bash
vercel logs --follow
```
- [ ] Verify no errors on page load
- [ ] Verify registration creates log entries
- [ ] Check for any warnings

#### Test 2: Environment Variables
```bash
vercel env ls
```
- [ ] Verify all required variables are set
- [ ] Verify no variables are exposed in client

#### Test 3: Cron Jobs
- [ ] Visit Vercel Dashboard → Project → Settings → Cron
- [ ] Verify both cron jobs are listed
- [ ] Verify schedule is correct (0 9 * * *)

### 3. Performance Tests

#### Test 1: Page Load Speed
- [ ] Use Google PageSpeed Insights
- [ ] Expect: >90 score
- [ ] Check Time to First Byte (TTFB)

#### Test 2: API Response Time
- [ ] Time registration API call
- [ ] Expect: <500ms for /api/register
- [ ] Expect: <200ms for /api/seats

#### Test 3: Database Query Performance
- [ ] Check Vercel Postgres dashboard
- [ ] Monitor query execution times
- [ ] Verify indexes are being used

### 4. Email Deliverability Tests

#### Test 1: Spam Score
- [ ] Use [mail-tester.com](https://www.mail-tester.com/)
- [ ] Send test email
- [ ] Expect: 8+/10 score

#### Test 2: Multiple Email Providers
- [ ] Test with Gmail
- [ ] Test with Outlook/Hotmail
- [ ] Test with Yahoo
- [ ] Test with ProtonMail
- [ ] Test with custom domain email

### 5. Load Testing (Optional)

For a 40-seat event, this is optional but recommended:

```bash
# Install k6
brew install k6  # or appropriate package manager

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,        // 10 virtual users
  duration: '30s', // for 30 seconds
};

export default function() {
  let res = http.get('https://your-url.vercel.app/api/seats');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
EOF

# Run load test
k6 run load-test.js
```

- [ ] Verify no errors at 10 concurrent users
- [ ] Check response times stay under 1s

### 6. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 7. Mobile Responsiveness

- [ ] Test on iPhone (various sizes)
- [ ] Test on Android (various sizes)
- [ ] Test on iPad
- [ ] Verify form inputs are easy to use
- [ ] Verify buttons are tappable
- [ ] Check text readability

## Monitoring Checklist

After launch, monitor:

### Daily (First Week)
- [ ] Check Vercel function logs
- [ ] Check Resend email delivery
- [ ] Verify registration count
- [ ] Check for errors

### Weekly
- [ ] Review registration trends
- [ ] Check database storage usage
- [ ] Monitor function execution time
- [ ] Review email bounce rate

### Before Event
- [ ] Export CSV backup
- [ ] Verify all reminder emails sent
- [ ] Final registration count
- [ ] Disable registration after event starts

## Issue Reporting Template

If you find issues, document:

```
**Issue:** [Brief description]
**Steps to Reproduce:**
1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happened]

**Environment:**
- Browser:
- Device:
- URL:

**Logs/Screenshots:** [Attach if applicable]
```

## Success Criteria

✅ All registrations complete successfully
✅ All emails delivered to inbox (not spam)
✅ Admin dashboard accessible and accurate
✅ CSV export contains all data
✅ No errors in production logs
✅ Page loads in <2 seconds
✅ Works on all major browsers
✅ Mobile-friendly
✅ Secure (passes security tests)
✅ Cron jobs execute on schedule

---

**Testing complete!** Your registration system is production-ready. 🎉
