# 🏢 SocioServe - Society Management System

SocioServe is a complete society management platform that streamlines communication, complaint management, bill payments, and community engagement between residents and society secretaries.

## Why Choose SocioServe?

- **Centralized Management** - All society operations in one place - complaints, bills, announcements, and polls
- **Real-time Updates** - Instant notifications for announcements and complaint status changes
- **Secure Payments** - Integrated Razorpay payment gateway with test mode for maintenance bills
- **Role-based Access** - Separate portals for residents and secretaries with appropriate permissions

## Features

### For Residents
- Register and track complaints with status updates
- View society announcements instantly
- Pay maintenance bills via secure payment gateway
- Vote on community polls
- View payment history and pending dues

### For Secretaries/Admins
- Manage resident complaints with comments and status updates
- Create and publish announcements
- Generate maintenance bills for residents
- Verify payment proofs uploaded by residents
- Create community polls for decision making
- Download payment reports as CSV

## Tech Stack

**Frontend:** React 18, Tailwind CSS, Axios, Vite, Lucide Icons
**Backend:** Node.js, Express.js, MongoDB, JWT, bcryptjs, Multer
**Payment:** Razorpay (Test Mode)

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Razorpay test account (free)

### Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/socioserve.git
cd socioserve

# Backend setup
cd backend
npm install
cp .env.example .env
PORT=3000
MONGO_URL=mongodb://localhost:27017/socioserve
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
# Start backend
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env
socioserve/
├── backend/
│   ├── config/
│   │   └── multer.js
│   ├── controller/
│   │   ├── admin.js
│   │   ├── announcement.js
│   │   ├── auth.js
│   │   ├── bill.js
│   │   ├── complaint.js
│   │   └── poll.js
│   ├── middleware/
│   │   ├── isadmin.js
│   │   └── isauthenticated.js
│   ├── models/
│   │   ├── user.js
│   │   ├── bill.js
│   │   ├── complaint.js
│   │   ├── announcement.js
│   │   └── poll.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── bill.js
│   │   ├── complaint.js
│   │   ├── announcement.js
│   │   ├── poll.js
│   │   └── payment.js
│   ├── utils/
│   │   └── db.js
│   └── index.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx
    │   │   ├── Bills.jsx
    │   │   ├── Complaints.jsx
    │   │   ├── Announcement.jsx
    │   │   ├── Polls.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Resident.jsx
    │   │   ├── Secretary.jsx
    │   │   ├── ToastNotification.jsx
    │   │   └── MockPaymentModal.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── Residentsdashboard.jsx
    │   │   └── Secretarydashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
We welcome contributions to enhance SocioServe! To contribute:

Fork the repository

1)Create a feature branch: git checkout -b feature-name

2)Commit your changes: git commit -m "Add feature"

3)Push to your branch: git push origin feature-name

4)Open a pull request
