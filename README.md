# InvoiceFlow

A full-stack Invoice & Client Management System built with the MERN stack.

InvoiceFlow allows business users to manage clients, create itemized invoices, calculate invoice totals, track payments, monitor outstanding amounts, generate PDF invoices, and manage invoice statuses from a centralized dashboard.

## Live Demo

- **Frontend:** https://frontend-gamma-two-19.vercel.app/
- **Backend API:** https://invoiceflow-backend-5zp7.onrender.com/
- **GitHub Repository:** https://github.com/Rushikes123/invoiceflow

---

## Features

### Authentication

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected frontend routes
- Protected backend APIs
- Logout functionality
- User-specific client, invoice, and payment data

### Client Management

- Create clients
- View all clients
- Search clients by:
  - Name
  - Company name
  - Email
- Edit client details
- Delete clients
- Prevent deletion of clients that have existing invoices

Supported client information:

- Name
- Company name
- Email
- Phone
- Billing address
- GST / tax number

### Invoice Management

- Create invoices for selected clients
- Multiple invoice line items
- Item description
- Quantity
- Rate
- Automatic line amount calculation
- Tax percentage
- Optional discount
- Automatic subtotal calculation
- Automatic tax calculation
- Automatic grand total calculation
- Unique invoice numbers such as `INV-2026-001`
- Issue date
- Due date
- Invoice statuses:
  - Draft
  - Unpaid
  - Paid
  - Overdue
- View invoice details
- Edit invoices
- Delete invoices
- Search invoices
- Filter invoices by:
  - Client
  - Invoice number
  - Status
  - Issue date

### Payment Management

- Record partial payments
- Record full payments
- Payment history
- Automatic outstanding amount calculation
- Automatic Paid status when an invoice is fully paid
- Prevent payments greater than the outstanding balance

Supported payment methods:

- Cash
- Bank Transfer
- UPI
- Card
- Other

### Dashboard

The dashboard provides:

- Total invoices
- Total billed amount
- Total paid amount
- Outstanding amount
- Recent invoices
- Invoice statuses

### PDF & Printing

- Generate invoice PDF
- Download invoice PDF
- Printable invoice layout
- PDF contains:
  - Invoice number
  - Client details
  - Invoice items
  - Subtotal
  - Tax
  - Discount
  - Grand total
  - Invoice status

---

## Bonus Features Implemented

The following optional assignment features are implemented:

1. PDF invoice generation and download
2. Print-friendly invoice layout
3. Partial and full payment tracking with payment history

The following optional bonus features are not currently implemented:

- Company logo in invoice PDF
- Invoice email sending
- CSV export
- Monthly billing/payment charts
- Automated tests

---

## Technology Stack

### Frontend

- React.js
- React Router
- Axios
- Tailwind CSS
- Vite
- JavaScript

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- PDFKit
- dotenv
- CORS

### Database

- MongoDB
- Mongoose ODM

---

## Project Architecture

```text
InvoiceFlow/
│
├── backend/
│   ├── assets/
│   │   └── invoiceflow-logo.png
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── dashboardController.js
│   │   ├── emailController.js
│   │   ├── invoiceController.js
│   │   └── paymentController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Invoice.js
│   │   ├── InvoiceCounter.js
│   │   └── Payment.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── emailRoutes.js
│   │   ├── invoiceRoutes.js
│   │   └── paymentRoutes.js
│   │
│   ├── utils/
│   │   ├── invoiceCalculator.js
│   │   └── invoicePdf.js
│   │
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── clients/
│   │   │   ├── invoices/
│   │   │   └── payments/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
└── README.md

```
Installation & Setup
Prerequisites
Make sure the following are installed:
•	Node.js 
•	npm 
•	Git 
•	MongoDB Atlas account or a MongoDB instance 
1. Clone the Repository
git clone https://github.com/Rushikes123/invoiceflow.git
cd invoiceflow
2. Backend Setup
cd backend
npm install
Create a .env file inside the backend folder.
3. Frontend Setup
Open another terminal:
cd frontend
npm install
________________________________________
Environment Variables
Create a backend/.env file with the required backend configuration:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Do not commit the .env file to GitHub.
The frontend API configuration should point to the backend URL being used for the environment.
________________________________________
Running the Project Locally
Start the Backend
cd backend
npm run dev
The backend will run on the configured port.
Start the Frontend
Open another terminal:
cd frontend
npm run dev
Vite will provide the frontend URL in the terminal.
________________________________________
Authentication / Login
Authentication is implemented using JWT.
For a fresh setup:
1.	Open the application. 
2.	Go to the Register page. 
3.	Create a user account. 
4.	Log in using the registered credentials. 
5.	Access the protected dashboard and application features. 
No real credentials or passwords are included in this repository.
________________________________________
API Structure
The backend uses REST-style API routes:
/api/auth
/api/clients
/api/invoices
/api/dashboard
/api/payments
/api/email
Protected routes use JWT authentication.
________________________________________
Business Logic
Invoice Calculation
Invoice totals are calculated using the invoice items and pricing information rather than relying on a total supplied by the frontend.
The calculation flow is:
Line Amount = Quantity × Rate

Subtotal = Sum of Line Amounts

Tax = Subtotal × Tax Percentage

Grand Total = Subtotal + Tax - Discount
Invoice Numbers
Invoices use unique invoice numbers such as:
INV-2026-001
INV-2026-002
INV-2026-003
An invoice counter is used to generate invoice numbers.
Payment Status
Payment records are maintained separately from invoices.
The application tracks:
•	Paid amount 
•	Outstanding amount 
•	Payment history 
•	Paid status 
Partial payments remain associated with the invoice through payment history.
Overdue Status
Invoice status considers the due date and payment state so that unpaid invoices past their due date can be treated as overdue.
Client Deletion
Clients with existing invoices cannot be deleted so that existing invoice records are not unintentionally disconnected from their client information.
________________________________________
Design Decisions
•	JWT is used for authentication and protected API access. 
•	Passwords are hashed using bcrypt before being stored. 
•	MongoDB with Mongoose is used for persistence and schema management. 
•	Backend controllers contain business logic while routes handle API endpoints. 
•	Invoice calculations are performed on the backend to avoid relying on manipulated totals from the browser. 
•	Invoice numbers are generated using a dedicated invoice counter. 
•	Payments are stored separately so payment history and partial payments can be maintained. 
•	Axios is used for frontend API communication. 
•	React Router is used for frontend navigation and protected routes. 
•	Tailwind CSS is used for responsive UI styling. 
•	PDF generation is handled on the backend using PDFKit. 
________________________________________
Error Handling and Validation
The application includes validation and error handling for common operations such as:
•	Authentication 
•	Client operations 
•	Invoice operations 
•	Payment operations 
•	Invalid or unauthorized requests 
•	Payments exceeding the outstanding balance 
•	Deletion of clients that have existing invoices 
The frontend also handles loading, empty and error states where applicable.
________________________________________
Security
•	Passwords are hashed using bcrypt. 
•	JWT is used for authenticated API requests. 
•	Protected frontend routes prevent unauthenticated access. 
•	Protected backend routes verify authentication. 
•	Database credentials and secrets are stored using environment variables. 
•	.env and other sensitive files should not be committed. 
________________________________________
Responsive UI
The frontend is built with React and Tailwind CSS and is designed to work across desktop and mobile screen sizes.
________________________________________
Known Limitations
The following optional bonus features from the assignment are not currently implemented:
•	Invoice email sending 
•	CSV export 
•	Monthly billing/payment charts 
•	Automated tests 
________________________________________
Deployment
Frontend
The React frontend is deployed using Vercel.
Live URL:
https://frontend-gamma-two-19.vercel.app/
Backend
The Node.js/Express backend is deployed using Render.
API URL:
https://invoiceflow-backend-5zp7.onrender.com/
Database
MongoDB Atlas is used for the application's database.
________________________________________
Screenshots / Demo
The deployed application can be accessed from the Live Demo section.

________________________________________
Code Quality
The project is organized into separate frontend and backend modules to keep responsibilities clear.
The backend follows a controller, route, model, middleware and utility structure.
The frontend separates pages, components, layouts, routes, context and API services.
________________________________________
Assignment Scope
This project was developed for the MERN Stack Developer Technical Assignment.
The implementation focuses on:
•	Functionality 
•	REST API design 
•	MongoDB data modeling 
•	Authentication 
•	Invoice business logic 
•	Payment tracking 
•	Dashboard reporting 
•	UI/UX 
•	Code organization 
•	Deployment 
________________________________________
Author
Rushikesh Raut
Built using the MERN stack.

