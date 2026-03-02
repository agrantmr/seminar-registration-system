# Launch Checklist

Complete this checklist before promoting your seminar registration system.

## Pre-Launch Setup

### 1. Project Setup ✓
- [x] Dependencies installed (`npm install`)
- [x] Project structure created
- [x] All files in place

### 2. Accounts Created
- [ ] Vercel account created
- [ ] Resend account created
- [ ] Email domain verified in Resend (optional but recommended)

### 3. Deployment
- [ ] Deployed to Vercel (`vercel --prod`)
- [ ] Production URL working
- [ ] Custom domain configured (optional)

### 4. Database Setup
- [ ] Vercel Postgres database created
- [ ] Database connected to project
- [ ] Schema executed (`schema.sql`)
- [ ] Tables created successfully

### 5. Environment Variables
All variables set in Vercel:
- [ ] `POSTGRES_URL` (auto-set by Vercel)
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM`
- [ ] `ADMIN_PASSWORD_HASH`
- [ ] `EVENT_DATE`
- [ ] `EVENT_TIME`
- [ ] `EVENT_LOCATION`
- [ ] `TOTAL_SEATS`
- [ ] `CRON_SECRET`
- [ ] `JWT_SECRET`

### 6. Cron Jobs
- [ ] Cron jobs visible in Vercel dashboard
- [ ] Week reminder cron scheduled (0 9 * * *)
- [ ] Day reminder cron scheduled (0 9 * * *)
- [ ] Manually tested both cron endpoints

## Testing Checklist

### Registration Flow
- [ ] Valid registration succeeds
- [ ] Confirmation email received
- [ ] Seat counter updates
- [ ] Duplicate email rejected
- [ ] Invalid email rejected
- [ ] Empty fields validated
- [ ] Rate limiting works (3 per hour per IP)
- [ ] Event full handling (at 40 registrations)

### Seat Counter
- [ ] Shows "Limited seats available" when >11 seats left
- [ ] Shows "Only X seats left" when ≤11 seats left
- [ ] Shows "Event Full" when 40 registrations reached
- [ ] Auto-refreshes every 30 seconds
- [ ] Updates after registration

### Admin Dashboard
- [ ] Login page accessible (`/admin.html`)
- [ ] Wrong password rejected
- [ ] Correct password grants access
- [ ] Dashboard shows accurate stats
- [ ] Registrations table displays all data
- [ ] Refresh button works
- [ ] CSV export downloads correctly
- [ ] Logout works

### Email Delivery
- [ ] Confirmation email arrives in inbox (not spam)
- [ ] Week reminder email works (when manually triggered)
- [ ] Day reminder email works (when manually triggered)
- [ ] Email formatting looks good
- [ ] Name personalization works
- [ ] Event details correct
- [ ] Tested on Gmail
- [ ] Tested on Outlook
- [ ] Tested on mobile email clients

### Security
- [ ] Admin password is strong
- [ ] JWT tokens expire after 24 hours
- [ ] Unauthorized admin access blocked
- [ ] Cron endpoints require secret
- [ ] SQL injection attempts fail
- [ ] XSS attempts sanitized
- [ ] HTTPS enabled (automatic with Vercel)

### Performance
- [ ] Page loads in <2 seconds
- [ ] API responses <500ms
- [ ] Database queries optimized
- [ ] No errors in Vercel logs

### Browser Compatibility
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Mobile Responsiveness
- [ ] Layout adapts to mobile screens
- [ ] Form inputs easy to use
- [ ] Buttons easily tappable
- [ ] Text readable without zoom
- [ ] Tested on iPhone
- [ ] Tested on Android

## Pre-Launch Final Checks

### Content Review
- [ ] Event title correct
- [ ] Event description accurate
- [ ] Event date/time correct (verify timezone!)
- [ ] Event location accurate
- [ ] Logo/image displays correctly
- [ ] Tagline correct
- [ ] No typos or grammar errors

### Technical Review
- [ ] All links work
- [ ] No console errors
- [ ] No 404 errors
- [ ] Favicon set (optional)
- [ ] Meta tags for SEO (optional)
- [ ] Analytics configured (optional)

### Email Templates
- [ ] Confirmation email reviewed
- [ ] Week reminder email reviewed
- [ ] Day reminder email reviewed
- [ ] All placeholders replaced correctly
- [ ] Links work (if any)
- [ ] Sender name/email correct

### Data Verification
- [ ] Test registration visible in admin
- [ ] Test registration in database
- [ ] CSV export contains all fields
- [ ] Timestamps are correct

## Launch Day

### Go Live
- [ ] Final deployment successful
- [ ] Production URL accessible
- [ ] Test one real registration
- [ ] Verify email received
- [ ] Check admin dashboard

### Promotion
- [ ] Registration URL ready to share
- [ ] Social media posts prepared
- [ ] Flyers/posters have correct URL
- [ ] QR code generated (optional)
- [ ] Email announcement ready

### Monitoring Setup
- [ ] Vercel logs monitoring enabled
- [ ] Email delivery monitoring (Resend dashboard)
- [ ] Calendar reminder for event date
- [ ] Admin dashboard bookmarked

## Post-Launch Monitoring

### Daily (First 3 Days)
- [ ] Check Vercel function logs
- [ ] Check Resend email logs
- [ ] Verify registrations are coming in
- [ ] Check for any errors
- [ ] Monitor seat count

### Weekly
- [ ] Review total registrations
- [ ] Check email delivery rate
- [ ] Download CSV backup
- [ ] Monitor for any issues

### One Week Before Event
- [ ] Verify week reminder emails sent
- [ ] Check all registrants received reminder
- [ ] Review final registration count
- [ ] Export final CSV

### One Day Before Event
- [ ] Verify day reminder emails sent
- [ ] Export final attendee list
- [ ] Print or prepare check-in list
- [ ] Close registration if needed

### Event Day
- [ ] Have registration list ready
- [ ] Check-in attendees
- [ ] Note no-shows (optional)

### After Event
- [ ] Archive registration data
- [ ] Download final CSV backup
- [ ] Send thank you email (optional, manual)
- [ ] Collect feedback (optional)

## Emergency Contacts

Keep these handy:

**Vercel Support:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com

**Resend Support:**
- Dashboard: https://resend.com/emails
- Docs: https://resend.com/docs
- Support: support@resend.com

**Database:**
- Vercel Postgres Dashboard: [Your DB URL]
- Connection string: [Saved securely]

## Troubleshooting Quick Reference

**Registration not working?**
1. Check Vercel function logs
2. Verify database connection
3. Check for error messages in browser console

**Emails not being sent?**
1. Check Resend dashboard
2. Verify RESEND_API_KEY is correct
3. Check spam folder
4. Verify EMAIL_FROM address

**Admin login failing?**
1. Verify ADMIN_PASSWORD_HASH is correct
2. Regenerate hash if needed
3. Check browser console for errors

**Seat counter not updating?**
1. Check /api/seats endpoint
2. Verify database connection
3. Check browser network tab

**Cron jobs not running?**
1. Check Vercel cron job status
2. Verify CRON_SECRET is correct
3. Check function logs at 9 AM UTC

## Success Metrics

Track these to measure success:

- [ ] Total registrations: ___ / 40
- [ ] Email delivery rate: ___% (target: >95%)
- [ ] Page load time: ___ms (target: <2000ms)
- [ ] Error rate: ___% (target: <1%)
- [ ] Admin access count: ___
- [ ] CSV exports: ___

## Final Sign-Off

Before launching:

- [ ] All setup tasks completed
- [ ] All tests passed
- [ ] Content reviewed by team
- [ ] Backup plan in place
- [ ] Contact information ready
- [ ] Confident in system stability

**Launched by:** ________________
**Date:** ________________
**Production URL:** ________________

---

## Post-Event Checklist

After the event:

- [ ] Export final registration list
- [ ] Archive all data
- [ ] Document lessons learned
- [ ] Note attendance rate: ___% (registered / showed up)
- [ ] Save feedback for next event
- [ ] Consider shutting down database to save costs (if no longer needed)

---

**You're ready to launch!** 🚀

This system is production-ready and will handle your seminar registrations smoothly.
