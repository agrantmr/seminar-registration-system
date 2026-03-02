# Seminar Registration System

A complete registration website for "A Beginner's Guide to AI" seminar with automated email confirmations and reminders.

## Features

- ✅ Registration form with real-time seat counter
- ✅ Automated confirmation emails
- ✅ Scheduled reminder emails (1 week and 1 day before event)
- ✅ Admin dashboard with authentication
- ✅ CSV export of registrations
- ✅ Rate limiting and security measures
- ✅ Fully responsive design
- ✅ Zero cost (free tier hosting)

## Tech Stack

- **Frontend**: Static HTML/CSS/JavaScript
- **Hosting**: Vercel
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Vercel Postgres
- **Email**: Resend
- **Scheduling**: Vercel Cron Jobs

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel Postgres

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

### 3. Create Database Schema

Connect to your Postgres database and run:

```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmation_sent BOOLEAN DEFAULT FALSE,
  week_reminder_sent BOOLEAN DEFAULT FALSE,
  day_reminder_sent BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON registrations(email);
CREATE INDEX idx_registered_at ON registrations(registered_at);
```

### 4. Generate Admin Password Hash

Run this script to generate a password hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password-here', 10).then(hash => console.log(hash));"
```

### 5. Configure Environment Variables

Create a `.env.local` file (for local development) and add these variables to your Vercel project:

```bash
# Database (auto-provided by Vercel Postgres)
POSTGRES_URL="postgres://..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Admin
ADMIN_PASSWORD_HASH="$2b$10$..."

# Event Configuration
EVENT_DATE="2026-04-15T22:00:00Z"
EVENT_TIME="7:00 PM - 8:30 PM"
EVENT_LOCATION="Community Hall, [Your Town]"
TOTAL_SEATS="40"

# Security
CRON_SECRET="random-secure-string-here"
JWT_SECRET="another-random-secure-string"
```

**Important Notes:**
- `EVENT_DATE` should be in ISO 8601 format (UTC timezone)
- `CRON_SECRET` and `JWT_SECRET` should be long random strings
- `EMAIL_FROM` should be a verified domain in Resend

### 6. Deploy to Vercel

```bash
vercel --prod
```

### 7. Configure Environment Variables in Vercel

Go to your Vercel project settings and add all environment variables from step 5.

### 8. Verify Cron Jobs

Check your Vercel dashboard to ensure the cron jobs are scheduled:
- `/api/cron/send-week-reminder` - Daily at 9:00 AM UTC
- `/api/cron/send-day-reminder` - Daily at 9:00 AM UTC

## Project Structure

```
/mnt/c/seminar/
├── api/                        # Serverless API endpoints
│   ├── register.js            # Registration endpoint
│   ├── seats.js               # Seat availability
│   ├── admin/
│   │   ├── auth.js           # Admin authentication
│   │   ├── registrations.js  # List registrations
│   │   └── export.js         # CSV export
│   └── cron/
│       ├── send-week-reminder.js
│       └── send-day-reminder.js
│
├── lib/                       # Utility modules
│   ├── db.js                 # Database helpers
│   ├── email.js              # Email sending
│   ├── auth.js               # JWT authentication
│   └── utils.js              # Validation & utilities
│
├── emails/                    # Email templates
│   ├── confirmation.html
│   ├── reminder-week.html
│   └── reminder-day.html
│
├── public/                    # Frontend files
│   ├── index.html            # Registration page
│   └── admin.html            # Admin dashboard
│
├── vercel.json               # Vercel configuration
├── package.json
└── .env.example
```

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/register` | POST | Submit registration | No |
| `/api/seats` | GET | Get seat availability | No |
| `/api/admin/auth` | POST | Admin login | No |
| `/api/admin/registrations` | GET | List all registrations | Yes (JWT) |
| `/api/admin/export` | GET | Export registrations to CSV | Yes (JWT) |
| `/api/cron/send-week-reminder` | GET | Send 1-week reminders | Cron Secret |
| `/api/cron/send-day-reminder` | GET | Send 1-day reminders | Cron Secret |

## Security Features

- **Rate Limiting**: 3 registration attempts per hour per IP
- **Input Validation**: Email format and name sanitization
- **SQL Injection Prevention**: Parameterized queries
- **Duplicate Prevention**: UNIQUE constraint on email
- **Admin Authentication**: Bcrypt password hashing + JWT tokens
- **Cron Security**: Secret verification in request headers
- **Transaction Safety**: Row locking to prevent race conditions

## Admin Dashboard

Access the admin dashboard at: `https://yourdomain.com/admin.html`

Features:
- View all registrations
- See current seat count
- Track email delivery status
- Export registrations to CSV
- JWT authentication (24-hour expiration)

## Email Reminders

The system automatically sends:
1. **Confirmation Email**: Immediately after registration
2. **Week Reminder**: 7 days before the event (9 AM UTC)
3. **Day Reminder**: 1 day before the event (9 AM UTC)

Cron jobs run daily at 9 AM UTC and check if reminders should be sent based on the event date.

## Local Development

1. Install dependencies: `npm install`
2. Create `.env.local` with your environment variables
3. Run development server: `vercel dev`
4. Access at: `http://localhost:3000`

## Testing Cron Jobs Manually

You can test cron jobs by calling them with the CRON_SECRET:

```bash
curl -X GET https://yourdomain.com/api/cron/send-week-reminder \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Troubleshooting

### Emails going to spam
- Verify your domain in Resend
- Set up SPF and DKIM records
- Use a custom domain for `EMAIL_FROM`

### Database connection issues
- Ensure `POSTGRES_URL` is correctly set
- Check Vercel Postgres connection limits
- Verify database schema is created

### Cron jobs not running
- Check Vercel dashboard for cron job status
- Verify `CRON_SECRET` is set correctly
- Check function logs for errors

## Cost Breakdown

All services are within free tiers:
- **Vercel Hosting**: Free (Hobby plan)
- **Vercel Postgres**: Free (256MB storage)
- **Resend**: Free (3,000 emails/month)
- **Total**: $0/month

## License

MIT
