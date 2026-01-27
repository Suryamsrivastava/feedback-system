You are a senior backend architect and full-stack engineer.
Act like you are designing a real production system for a service-based company.

I want you to design and implement a secure, production-grade
customer feedback system.

Read ALL requirements carefully and do NOT violate any constraint.

==================================================
CURRENT PROJECT REALITY
==================================================

1. Frontend is built using Next.js and lives inside a folder named "frontend".
2. Backend is a completely separate Node.js (Express) application
   inside a folder named "backend".
3. Backend APIs are tested using Postman and deployed independently.
4. Backend logic CANNOT be moved into Next.js API routes.
5. Feedback form UI already exists.
6. Feedback submission logic already exists and saves data into MySQL.
7. Backend folder structure already exists as:

backend/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── .env
├── .env.example
├── server.js

==================================================
EXISTING DATABASE STRUCTURE (IMPORTANT)
==================================================

users table columns:
- id
- order_id
- username
- mobile
- email
- address
- service_start_datetime
- service_complete_datetime

user_feedback table columns (already exist):
- id
- order_id
- name
- experience
- buddy_on_time
- buddy_courteous
- buddy_handling
- buddy_pickup
- sales_understanding
- sales_clarity
- sales_professionalism
- sales_transparency
- sales_followup
- sales_decision
- cx_onboarding
- cx_courteous
- cx_resolution
- cx_communication
- recommendation
- tip_asked
- tip_details
- liked
- improvement
- created_at
- email
- service_complete_datetime

I will manually add any additional required columns.

==================================================
GOAL
==================================================

Build an automated feedback system such that:

1. When a customer’s service is completed
   (service_complete_datetime is set in users table),
   the backend automatically triggers an email.
2. The email contains an individual feedback form link.
3. Each customer must receive a unique feedback link.
4. Feedback must always map to the correct order.
5. order_id must NEVER be exposed in the URL.
6. URL tampering must be impossible.
7. The exact feedback link sent must be stored
   in the user_feedback table for audit clarity.

==================================================
SECURITY REQUIREMENTS (CRITICAL)
==================================================

1. order_id must never appear in the feedback URL.
2. A cryptographically secure random token must be used.
3. Token must be:
   - Unguessable
   - One-time use
   - Mapped internally to order_id
4. Backend resolves order_id internally using the token.
5. Feedback can be submitted only once per order.
6. Token should expire after submission (and optionally time-based).

==================================================
NEW COLUMNS (ASSUME THEY EXIST)
==================================================

In user_feedback table:
- feedback_token (unique)
- feedback_link
- feedback_sent_at
- feedback_submitted_at

==================================================
REQUIRED END-TO-END FLOW
==================================================

1. Service is marked complete in users table.
2. Backend detects the completion event.
3. Backend generates a secure feedback token.
4. Backend generates a feedback link using the token.
5. Backend stores:
   - order_id
   - email
   - feedback_token
   - feedback_link
   - feedback_sent_at
6. Backend sends email containing feedback link.
7. Customer opens the link.
8. Frontend loads feedback form using token.
9. Frontend calls backend to validate token.
10. Backend validates token and resolves order_id internally.
11. Customer submits feedback.
12. Backend saves feedback against correct order_id.
13. feedback_submitted_at is set.
14. Token becomes invalid forever.

==================================================
BACKEND ARCHITECTURE REQUIREMENTS
==================================================

Use clean, industry-standard Node.js (Express) architecture:

backend/
├── routes/        → only route definitions
├── controllers/   → request/response handling
├── services/      → business logic
├── config/        → DB & environment config
├── middleware/    → validation / security
└── utils/         → token, helpers

Rules:
- Routes must not contain logic.
- Controllers must be thin.
- Services must contain business logic.
- Utils must contain reusable helpers.

==================================================
API ENDPOINTS TO IMPLEMENT
==================================================

POST /api/orders/complete
GET  /api/feedback/validate/:token
POST /api/feedback/submit
GET  /api/admin/feedback

==================================================
WHAT I WANT YOU TO DELIVER
==================================================

1. Full architecture explanation step-by-step.
2. How service completion triggers feedback email.
3. Backend folder/file structure explanation.
4. Express route definitions.
5. Controller implementations.
6. Service-layer logic.
7. Secure token generation logic.
8. Email sending logic (provider-agnostic).
9. Frontend integration flow (how frontend uses APIs).
10. Security checks & edge cases.
11. Best practices used in real companies.

IMPORTANT:
- This must look like a real production system.
- Do NOT oversimplify.
- Respect all constraints.
- Assume this code will be reviewed by senior engineers.

Start with architecture explanation, then provide code examples.
