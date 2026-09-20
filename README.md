# InvoiceFlow

A full-stack Invoice & Client Management System built with the MERN stack.

InvoiceFlow allows business users to manage clients, create itemized invoices, calculate invoice totals, track payments, monitor outstanding amounts, generate PDF invoices, and manage invoice statuses from a centralized dashboard.

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
- Unique invoice numbers
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
- Automatic Paid status when invoice is fully paid
- Prevent payments greater than outstanding balance

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
- InvoiceFlow company logo
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

The following optional assignment features have been implemented:

1. PDF invoice generation
2. Company logo in invoice PDF
3. Print-friendly invoice layout
4. Partial and full payment tracking with payment history

The assignment also lists email sending, CSV export, charts, and automated tests as optional bonuses. These are currently not implemented.

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
│   ├── .env
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