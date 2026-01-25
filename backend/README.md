# Feedback System Backend 🚀

Complete Node.js backend for feedback system with MySQL and Excel integration.

## 📋 Features

- ✅ Save feedback to MySQL database
- ✅ Automatically export feedback to Excel file
- ✅ RESTful API endpoints
- ✅ Transaction support for data integrity
- ✅ Foreign key validation
- ✅ Duplicate feedback prevention
- ✅ Error handling and logging
- ✅ CORS enabled for frontend integration

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Excel:** ExcelJS
- **Environment:** dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/
│   └── feedbackController.js # Business logic
├── routes/
│   └── feedbackRoutes.js    # API routes
├── services/
│   └── excelService.js      # Excel operations
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Main entry point
└── README.md
```

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

or

```bash
pnpm install
```

or

```bash
yarn install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=feedback_db
DB_PORT=3306

# Excel Configuration
EXCEL_FILE_PATH=./feedbacks.xlsx
EXCEL_SHEET_NAME=User Feedbacks

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database

Run the SQL scripts to create tables and insert sample data:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    service_start_datetime DATETIME NOT NULL,
    service_complete_datetime DATETIME NOT NULL
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    experience ENUM('very-poor','poor','average','good','excellent') NOT NULL,
    buddy_on_time TINYINT,
    buddy_courteous TINYINT,
    buddy_handling TINYINT,
    buddy_pickup TINYINT,
    sales_understanding TINYINT,
    sales_clarity TINYINT,
    sales_professionalism TINYINT,
    sales_transparency TINYINT,
    sales_followup TINYINT,
    sales_decision TINYINT,
    cx_onboarding TINYINT,
    cx_courteous TINYINT,
    cx_resolution TINYINT,
    cx_communication TINYINT,
    recommendation TINYINT NOT NULL,
    tip_asked ENUM('yes','no') NOT NULL,
    tip_details TEXT,
    liked TEXT,
    improvement TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES users(order_id)
);

-- Add additional columns
ALTER TABLE user_feedback
ADD COLUMN email VARCHAR(100),
ADD COLUMN service_complete_datetime DATETIME;
```

## ▶️ Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

### 2. Submit Feedback
```
POST /api/feedback/submit
```

**Request Body:**
```json
{
  "order_id": "ORD1001",
  "name": "Amit Sharma",
  "email": "amit.sharma@gmail.com",
  "service_complete_datetime": "2025-01-05 11:30:00",
  "experience": "excellent",
  "buddy_on_time": 5,
  "buddy_courteous": 5,
  "buddy_handling": 4,
  "buddy_pickup": 5,
  "sales_understanding": 4,
  "sales_clarity": 5,
  "sales_professionalism": 5,
  "sales_transparency": 4,
  "sales_followup": 5,
  "sales_decision": 4,
  "cx_onboarding": 5,
  "cx_courteous": 5,
  "cx_resolution": 4,
  "cx_communication": 5,
  "recommendation": 10,
  "tip_asked": "no",
  "tip_details": "",
  "liked": "Excellent service and timely delivery",
  "improvement": "Nothing to improve"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "feedback_id": 1,
    "order_id": "ORD1001"
  }
}
```

### 3. Get All Feedbacks
```
GET /api/feedback/all
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### 4. Get Feedback by Order ID
```
GET /api/feedback/order/:order_id
```

**Example:**
```
GET /api/feedback/order/ORD1001
```

### 5. Get User Details by Order ID
```
GET /api/feedback/user/:order_id
```

**Example:**
```
GET /api/feedback/user/ORD1001
```

### 6. Get Statistics
```
GET /api/feedback/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_feedbacks": 100,
    "avg_recommendation": 8.5,
    "excellent_count": 45,
    "good_count": 30,
    "average_count": 15,
    "poor_count": 8,
    "very_poor_count": 2,
    "tip_asked_yes": 20,
    "tip_asked_no": 80
  }
}
```

## 🔒 Validation & Error Handling

- ✅ Validates required fields
- ✅ Checks if order_id exists in users table
- ✅ Prevents duplicate feedback submission
- ✅ Transaction rollback on MySQL errors
- ✅ Graceful handling of Excel errors
- ✅ Detailed error messages in development mode

## 📊 Excel Export

- Feedback is automatically saved to Excel file
- Headers are styled with blue background
- Auto-adjusting column widths
- Timestamp of submission included
- Excel file created automatically if it doesn't exist

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | feedback_db |
| DB_PORT | MySQL port | 3306 |
| EXCEL_FILE_PATH | Excel file location | ./feedbacks.xlsx |
| EXCEL_SHEET_NAME | Excel sheet name | User Feedbacks |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## 🐛 Debugging

Check server logs for detailed information:
- ✅ Database connection status
- ✅ Excel file initialization
- ✅ API request logs
- ✅ Error stack traces (in development mode)

## 📝 Notes

- Email and service_complete_datetime are auto-populated from users table if not provided
- Excel save errors don't fail the request (MySQL is primary)
- Uses connection pooling for better performance
- CORS enabled for frontend integration

## 👨‍💻 Author

Built with ❤️ for feedback collection

---

**Happy Coding! 🚀**
