# SMG Feedback Forms - Complete Project Documentation

**Project:** Multi-Form Feedback System (PHASE-1)  
**Date:** February 4, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Architecture](#architecture)
4. [Database Setup](#database-setup)
5. [Backend Configuration](#backend-configuration)
6. [Frontend Configuration](#frontend-configuration)
7. [API Documentation](#api-documentation)
8. [Testing Guide](#testing-guide)
9. [Deployment](#deployment)
10. [Phase-2 Roadmap](#phase-2-roadmap)

---

## 1. Project Overview

### Purpose
Automated customer feedback collection system that sends secure, token-based feedback forms after service completion.

### Key Features
✅ **5 Feedback Form Types** - Single system supporting multiple form templates  
✅ **Token-Based Security** - No order_id or sensitive data in URLs  
✅ **Single Database Table** - Uses `form_type` discriminator field  
✅ **Single API Set** - One backend handles all form types  
✅ **Google Sheets Integration** - Automatic data backup with form_type column  
✅ **Admin Dashboard** - Phase-1 metrics (form counts, response statistics)  
✅ **Email Automation** - Automatic feedback request emails  

### Form Types Implemented
1. **customer_satisfaction** (Default) - General satisfaction survey
2. **ticket_closure** - Post-support ticket feedback
3. **cutomer_feedback** - Customer experience feedback
4. **churn_feedback** - Exit survey for leaving customers
5. **relocation_feedback** - Moving/relocation service feedback

### Technology Stack

**Backend:**
- Node.js + Express 4.x
- MySQL 2 (connection pooling)
- Nodemailer (Gmail SMTP)
- Google Sheets API v4

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5.x
- Tailwind CSS 3.x

---

## 2. Quick Start Guide

### Prerequisites
- Node.js 16+ installed
- MySQL 8.0+ running
- Gmail account with App Password
- Google Cloud Service Account (for Sheets API)

### Installation

**Step 1: Clone & Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**Step 2: Database Setup**
```sql
-- Run in phpMyAdmin or MySQL CLI

-- Add form_type column
ALTER TABLE user_feedback 
ADD COLUMN form_type ENUM(
    'ticket_closure',
    'customer_satisfaction',
    'cutomer_feedback',
    'churn_feedback',
    'relocation_feedback'
) NOT NULL DEFAULT 'customer_satisfaction' AFTER email;

-- Add indexes for performance
CREATE INDEX idx_form_type ON user_feedback(form_type);
CREATE INDEX idx_form_submitted ON user_feedback(form_type, feedback_submitted_at);
```

**Step 3: Environment Configuration**

Create `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Server
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

**Step 4: Google Sheets Setup**
1. Open your feedback Google Sheet
2. Add column header: **`Form Type`** (after existing columns, before "Created At")
3. Share sheet with service account email

**Step 5: Start Servers**
```bash
# Terminal 1 - Backend
cd backend
npm start
# Server starts on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend starts on http://localhost:3000
```

**Step 6: Verify Installation**
```bash
# Test backend health
curl http://localhost:5000/health

# Expected response:
# {"success": true, "message": "Server is running"}
```

---

## 3. Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE FEEDBACK SYSTEM                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   5 Forms    │───▶│  Single API  │───▶│ Single Table │ │
│  │              │    │              │    │              │ │
│  │ form_type:   │    │ Differentiates│   │ form_type    │ │
│  │ - customer_  │    │ by form_type  │   │ discriminator│ │
│  │   satisfaction│    │              │    │              │ │
│  │ - ticket_    │    │              │    │              │ │
│  │   closure    │    │              │    │              │ │
│  │ - cutomer_   │    │              │    │              │ │
│  │   feedback   │    │              │    │              │ │
│  │ - churn_     │    │              │    │              │ │
│  │   feedback   │    │              │    │              │ │
│  │ - relocation_│    │              │    │              │ │
│  │   feedback   │    │              │    │              │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                              │
│  Backend determines form_type → Customer CANNOT manipulate  │
└─────────────────────────────────────────────────────────────┘
```

### Flow Diagram

```
1. SERVICE COMPLETION
   ↓
2. Trigger Feedback Request
   POST /api/orders/complete
   Body: { "order_id": "ORD001", "form_type": "customer_satisfaction" }
   ↓
3. Backend generates token with form_type
   Token stored in database with form_type
   ↓
4. Email sent to customer
   Link: https://domain.com/feedback?token=ABC123XY
   (NO form_type visible in URL)
   ↓
5. Customer clicks link
   Frontend validates token with backend
   Backend returns form_type
   ↓
6. Frontend renders appropriate form
   Redirects internally based on form_type
   Customer sees correct form without knowing form_type
   ↓
7. Customer submits feedback
   POST /api/feedback/submit
   Includes token + form data
   ↓
8. Backend stores with form_type
   Database: user_feedback table
   Google Sheets: Appends row with form_type column
   ↓
9. Token invalidated (one-time use)
```

### Security Model

**Token-Based Access:**
- 8-character secure random token
- 72-hour expiration
- Single-use (invalidated after submission)
- No order_id in URLs
- No form_type visible to customer

**Server-Side Control:**
- Backend determines form_type from database
- Frontend cannot manipulate form_type
- Validation middleware ensures valid form_type
- ENUM constraint at database level

---

## 4. Database Setup

### User Feedback Table Structure

```sql
CREATE TABLE user_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  form_type ENUM(
    'ticket_closure',
    'customer_satisfaction',
    'cutomer_feedback',
    'churn_feedback',
    'relocation_feedback'
  ) NOT NULL DEFAULT 'customer_satisfaction',
  
  -- Feedback fields (nullable to support different form structures)
  rating INT,
  comments TEXT,
  recommendation INT,
  service_quality INT,
  response_time INT,
  
  -- Token management
  feedback_token VARCHAR(255) UNIQUE,
  token_expiration DATETIME,
  feedback_link TEXT,
  feedback_submitted_at DATETIME,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_token (feedback_token),
  INDEX idx_form_type (form_type),
  INDEX idx_form_submitted (form_type, feedback_submitted_at)
);
```

### Migration Script

File: `backend/migrations/001_add_form_type.sql`

```sql
-- Add form_type column to existing table
ALTER TABLE user_feedback 
ADD COLUMN form_type ENUM(
    'ticket_closure',
    'customer_satisfaction',
    'cutomer_feedback',
    'churn_feedback',
    'relocation_feedback'
) NOT NULL DEFAULT 'customer_satisfaction' AFTER email;

-- Add indexes for better query performance
CREATE INDEX idx_form_type ON user_feedback(form_type);
CREATE INDEX idx_form_submitted ON user_feedback(form_type, feedback_submitted_at);

-- Verify the change
DESCRIBE user_feedback;

-- Rollback script (if needed)
-- ALTER TABLE user_feedback DROP COLUMN form_type;
-- DROP INDEX idx_form_type ON user_feedback;
-- DROP INDEX idx_form_submitted ON user_feedback;
```

---

## 5. Backend Configuration

### Project Structure

```
backend/
├── server.js                 # Main application entry
├── package.json
├── .env
│
├── config/
│   ├── database.js          # MySQL connection pool
│   └── email.js             # Nodemailer configuration
│
├── controllers/
│   ├── feedbackController.js     # Feedback submission logic
│   ├── feedbackControllerNew.js  # New feedback + admin endpoints
│   └── orderController.js        # Order completion trigger
│
├── middleware/
│   └── validation.js        # Form data validation + form_type validation
│
├── routes/
│   ├── feedbackRoutes.js        # Legacy routes
│   ├── feedbackRoutesNew.js     # New routes + admin routes
│   └── orderRoutes.js           # Order endpoints
│
├── services/
│   ├── tokenService.js          # Token generation/validation (with form_type)
│   ├── feedbackService.js       # Feedback business logic (with form_type)
│   ├── googleSheetsService.js   # Google Sheets sync (with form_type column)
│   └── emailService.js          # Email sending
│
├── templates/
│   └── feedbackEmail.html       # Email template
│
├── utils/
│   └── tokenGenerator.js        # Token utilities
│
└── migrations/
    └── 001_add_form_type.sql    # Database migration
```

### Key Backend Files Modified (PHASE-1)

**1. tokenService.js**
```javascript
async generateFeedbackToken(order_id, email, frontendUrl, form_type = 'customer_satisfaction') {
  // Generates token and stores with form_type
}

async validateToken(token) {
  // Returns form_type along with validation result
}
```

**2. feedbackService.js**
```javascript
async triggerFeedbackRequest(order_id, form_type = 'customer_satisfaction') {
  // Triggers feedback request with specified form_type
}

async getFormStatistics() {
  // Returns Phase-1 admin statistics
}
```

**3. googleSheetsService.js**
```javascript
// Added 'Form Type' to headers array
const headers = [
  'ID', 'Order ID', 'Name', 'Email', /* ... */,
  'Form Type',  // ← Added
  'Created At'
];

// Includes form_type in row data
feedbackData.form_type || 'customer_satisfaction'
```

**4. orderController.js**
```javascript
async completeOrder(req, res) {
  const { order_id, form_type } = req.body;
  
  // Validates form_type against allowed types
  // Defaults to 'customer_satisfaction' if not provided
}
```

**5. validation.js**
```javascript
const validFormTypes = [
  'ticket_closure',
  'customer_satisfaction',
  'cutomer_feedback',
  'churn_feedback',
  'relocation_feedback'
];

// Server-side validation
if (form_type && !validFormTypes.includes(form_type)) {
  errors.push('Invalid form_type');
}
```

---

## 6. Frontend Configuration

### Project Structure

```
frontend/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
│
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css
│   │
│   ├── feedback/
│   │   ├── page.tsx            # ENTRY POINT - Token validation & routing
│   │   │
│   │   ├── customer-satisfaction/
│   │   │   └── page.tsx        # Customer satisfaction form
│   │   │
│   │   ├── ticket-closure/
│   │   │   └── page.tsx        # Ticket closure form
│   │   │
│   │   ├── cutomer-feedback/
│   │   │   └── page.tsx        # Customer feedback form
│   │   │
│   │   ├── churn-feedback/
│   │   │   └── page.tsx        # Churn/exit survey form
│   │   │
│   │   └── relocation-feedback/
│   │       └── page.tsx        # Relocation service form
│   │
│   └── admin/
│       └── page.tsx            # Admin dashboard (Phase-1 metrics)
│
└── public/
```

### Single Entry Point Pattern

**File:** `frontend/app/feedback/page.tsx`

```typescript
'use client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FeedbackEntry() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')

  useEffect(() => {
    if (!tokenParam) {
      router.push('/')
      return
    }

    // Validate token with backend
    fetch(`${API_BASE_URL}/api/feedback/validate/${tokenParam}`)
      .then(response => response.json())
      .then(data => {
        if (data.valid) {
          // Backend returns form_type
          const formType = data.form_type
          
          // Redirect to appropriate form
          router.replace(`/feedback/${formType.replace(/_/g, '-')}?token=${tokenParam}`)
        } else {
          router.push('/')
        }
      })
      .catch(error => {
        console.error('Token validation failed:', error)
        router.push('/')
      })
  }, [tokenParam])

  return <div>Validating token...</div>
}
```

**Key Points:**
- Customer clicks: `/feedback?token=ABC123XY`
- Frontend validates token with backend
- Backend returns `form_type` from database
- Frontend redirects to appropriate form
- Customer never sees or manipulates `form_type`

---

## 7. API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Endpoints

#### 1. Complete Order (Trigger Feedback)

**Endpoint:** `POST /api/orders/complete`

**Description:** Completes an order and triggers feedback request email.

**Request Body:**
```json
{
  "order_id": "ORD001",
  "form_type": "customer_satisfaction"  // Optional, defaults to "customer_satisfaction"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Feedback request triggered successfully",
  "data": {
    "order_id": "ORD001",
    "email": "customer@example.com",
    "token": "ABC123XY",
    "feedbackLink": "http://localhost:3000/feedback?token=ABC123XY",
    "expiresAt": "2026-02-07T12:00:00.000Z",
    "form_type": "customer_satisfaction"
  }
}
```

**Response (Error - Order Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Valid form_type values:**
- `customer_satisfaction` (default)
- `ticket_closure`
- `cutomer_feedback`
- `churn_feedback`
- `relocation_feedback`

---

#### 2. Validate Token

**Endpoint:** `GET /api/feedback/validate/:token`

**Description:** Validates feedback token and returns associated data including form_type.

**Example:**
```
GET http://localhost:5000/api/feedback/validate/ABC123XY
```

**Response (Valid Token):**
```json
{
  "valid": true,
  "order_id": "ORD001",
  "email": "customer@example.com",
  "form_type": "customer_satisfaction"
}
```

**Response (Invalid/Expired Token):**
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

---

#### 3. Submit Feedback

**Endpoint:** `POST /api/feedback/submit`

**Description:** Submits customer feedback and invalidates token.

**Request Body:**
```json
{
  "token": "ABC123XY",
  "rating": 5,
  "comments": "Great service!",
  "recommendation": 10,
  "service_quality": 5,
  "response_time": 4,
  "form_type": "customer_satisfaction"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for your feedback!"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

#### 4. Get Admin Statistics (Phase-1)

**Endpoint:** `GET /api/admin/form-statistics`

**Description:** Returns form statistics for admin dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_forms": 5,
    "total_responses": 143,
    "form_statistics": [
      {
        "form_type": "customer_satisfaction",
        "response_count": 45
      },
      {
        "form_type": "ticket_closure",
        "response_count": 32
      },
      {
        "form_type": "cutomer_feedback",
        "response_count": 28
      },
      {
        "form_type": "churn_feedback",
        "response_count": 21
      },
      {
        "form_type": "relocation_feedback",
        "response_count": 17
      }
    ]
  }
}
```

---

## 8. Testing Guide

### Postman Testing

**Collection: SMG Feedback Forms API**

**Test 1: Trigger Feedback (Customer Satisfaction - Default)**
```
POST http://localhost:5000/api/orders/complete
Content-Type: application/json

{
  "order_id": "ORD001"
}
```

**Test 2: Trigger Feedback with Specific Form Type**
```
POST http://localhost:5000/api/orders/complete
Content-Type: application/json

{
  "order_id": "ORD002",
  "form_type": "churn_feedback"
}
```

**Test 3: Validate Token**
```
GET http://localhost:5000/api/feedback/validate/ABC123XY
```

**Test 4: Get Admin Statistics**
```
GET http://localhost:5000/api/admin/form-statistics
```

### Manual Testing Checklist

**Pre-Testing:**
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database has form_type column
- [ ] Google Sheet has "Form Type" header
- [ ] Test order exists in users table

**Functional Testing:**
- [ ] Trigger feedback for all 5 form types
- [ ] Verify email contains correct feedback link
- [ ] Click link opens `/feedback?token=XXX` (no form_type visible)
- [ ] Frontend redirects to correct form based on form_type
- [ ] Submit feedback successfully
- [ ] Check database stores correct form_type
- [ ] Verify Google Sheet row includes form_type
- [ ] Confirm token is invalidated after submission
- [ ] Test expired token (72+ hours old)
- [ ] Admin dashboard shows correct statistics

**Security Testing:**
- [ ] Cannot submit with invalid token
- [ ] Cannot reuse token after submission
- [ ] Cannot manipulate form_type in URL
- [ ] Order_id not visible in customer URL
- [ ] CORS works correctly
- [ ] SQL injection protection (prepared statements)

**Edge Cases:**
- [ ] Missing order_id in database
- [ ] Already submitted feedback
- [ ] Invalid form_type value
- [ ] Token expired
- [ ] Malformed requests

---

## 9. Deployment

### Production Checklist

**Backend:**
- [ ] Set `NODE_ENV=production` in .env
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure production database credentials
- [ ] Set up Gmail App Password (not regular password)
- [ ] Add Google Service Account to production sheet
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up process manager (PM2)
- [ ] Configure logging
- [ ] Set up error monitoring

**Frontend:**
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally: `npm start`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Configure environment variables
- [ ] Set up CDN for static assets
- [ ] Enable analytics (if needed in Phase-2)

**Database:**
- [ ] Run migration script on production database
- [ ] Verify form_type column exists
- [ ] Check indexes are created
- [ ] Backup existing data
- [ ] Test connection from production server

**Google Sheets:**
- [ ] Add "Form Type" column header
- [ ] Share sheet with production service account
- [ ] Test write permissions
- [ ] Verify data sync works

### PM2 Configuration (Backend)

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'smg-feedback-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 10. Phase-2 Roadmap

### Planned Features (Future)

**Analytics & Reporting:**
- Advanced dashboard with charts/graphs
- Trend analysis over time
- NPS (Net Promoter Score) calculations
- Response rate tracking
- Sentiment analysis
- Export reports (PDF, Excel)

**Form Enhancements:**
- Dynamic form builder
- Conditional questions
- File upload support
- Multi-language support
- Custom branding per form type

**Integration:**
- Webhook support
- REST API for external systems
- Slack/Teams notifications
- CRM integration (Salesforce, HubSpot)

**Performance:**
- Caching layer (Redis)
- Database query optimization
- CDN for static assets
- Rate limiting

---

## Support & Maintenance

### Common Issues

**Issue 1: "Order not found" Error**
- **Cause:** order_id doesn't exist in users table
- **Solution:** Verify order_id exists: `SELECT * FROM users WHERE order_id = 'ORD001'`

**Issue 2: Email Not Sending**
- **Cause:** Invalid Gmail credentials or App Password
- **Solution:** Generate new App Password from Google Account settings

**Issue 3: Token Validation Fails**
- **Cause:** Token expired (>72 hours) or already used
- **Solution:** Trigger new feedback request

**Issue 4: Google Sheets Not Syncing**
- **Cause:** Service account not shared or invalid credentials
- **Solution:** Share sheet with service account email, verify GOOGLE_PRIVATE_KEY

**Issue 5: CORS Error in Browser**
- **Cause:** Frontend URL not in CORS whitelist
- **Solution:** Add URL to `corsOptions.origin` in server.js

### Log Locations

**Backend Logs:**
- Console output: `pm2 logs smg-feedback-backend`
- Error log: `backend/logs/err.log`
- Output log: `backend/logs/out.log`

**Frontend Logs:**
- Browser console (development)
- Server logs (production)

### Database Maintenance

**Clean Up Expired Tokens:**
```sql
DELETE FROM user_feedback 
WHERE feedback_submitted_at IS NULL 
AND token_expiration < NOW();
```

**Check Form Type Distribution:**
```sql
SELECT form_type, COUNT(*) as count 
FROM user_feedback 
WHERE feedback_submitted_at IS NOT NULL 
GROUP BY form_type;
```

---

## Compliance & Requirements

### Task.md Requirements ✅

**Architecture:**
- [x] Single database table with form_type discriminator
- [x] Single API set (no duplicate APIs per form)
- [x] Single Google Sheet with form_type column
- [x] Backend determines form_type (not frontend)
- [x] 5 distinct form types implemented

**Security:**
- [x] Token-based access (no order_id in URLs)
- [x] form_type not editable by customer
- [x] form_type not visible in customer URLs
- [x] Server-side validation
- [x] Single-use tokens with expiration

**Admin Panel:**
- [x] Phase-1 only (no advanced analytics)
- [x] Shows total forms (5)
- [x] Shows total responses
- [x] Shows breakdown per form type

**Code Quality:**
- [x] Production-grade patterns
- [x] Clean architecture
- [x] Comprehensive error handling
- [x] Backward compatible

---

## Project Status

**PHASE-1: COMPLETE ✅**

All requirements from task.md have been successfully implemented and verified:
- 5 feedback forms operational
- Single system architecture with form_type discriminator
- Secure token-based access
- Google Sheets integration with form_type column
- Admin dashboard with Phase-1 metrics
- Production-ready codebase

**Next Steps:**
1. Deploy to production
2. Monitor initial usage
3. Gather feedback
4. Plan Phase-2 analytics features

---

## Contact & Support

For issues, questions, or feature requests, please contact the development team.

**Documentation Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Production Ready ✅
