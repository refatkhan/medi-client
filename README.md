# MediCamp - Medical Camp Management System (Frontend)

![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react)
![Material UI](https://img.shields.io/badge/Material--UI-5.15.0-brightgreen?logo=mui)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?logo=vercel)
![GitHub commits](https://img.shields.io/badge/Commits-20+-yellow)

Welcome to **MediCamp**, a Medical Camp Management System (MCMS) frontend built with React. This system helps organizers and participants manage medical camps efficiently.

---

## 🌐 Live Site

[Frontend Live Site Link](YOUR_FRONTEND_LIVE_URL_HERE)

---

## 👤 Organizer Credentials (Demo)

- **Email:** organizer@example.com
- **Password:** Organizer@123

---

## 🔑 Features

1. **Responsive Design** – Works on mobile, tablet, and desktop, including dashboards.
2. **Authentication & Authorization** – JWT authentication with login, register, and social login.
3. **Dynamic Navbar** – Shows user profile, dashboard link, and logout option for logged-in users.
4. **Home Page** – Banner slider, popular camps section, “See All Camps” button.
5. **Available Camps Page** – List all camps with search, sorting, and layout toggle.
6. **Camp Details Page** – Participant registration modal, auto-update participant count.
7. **Participant Dashboard** – Analytics charts, profile management, registered camps, payment history, feedback system.
8. **Organizer Dashboard** – Add/manage camps, manage participants, confirm payments, handle cancellations.
9. **Notifications** – Sweet alerts/toasts for CRUD operations and payments.
10. **Private Routes** – Dashboard and sensitive pages protected.
11. **404 Page** – Friendly page for undefined routes.
12. **Pagination & Search** – Tables include search bars and pagination (10 rows per page).
13. **Environment Variables** – Firebase config and API keys hidden.
14. **Optional Enhancements** – Animations, Axios interceptors, React Awesome Button, React-Select.

---

## 🛠 Tech Stack

- **Frontend:** React, Material-UI, Tailwind CSS, Framer Motion
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router DOM
- **Forms:** React Hook Form / Formik
- **Charts:** Recharts
- **Notifications:** SweetAlert2 / Toasts
- **Authentication:** Firebase Auth, JWT
- **Deployment:** Vercel

---

## 📁 Project Structure

src/
│
├─ components/ # Reusable UI components (Navbar, Footer, CampCard)
├─ pages/ # Pages (Home, AvailableCamps, CampDetails, JoinUS)
├─ dashboard/ # Organizer & Participant dashboards
├─ context/ # Global state or context API
├─ hooks/ # Custom hooks
├─ services/ # API calls using TanStack Query
├─ utils/ # Helpers (auth, validations, etc.)
└─ App.jsx # Root component with routes

---

## 🔧 Installation

1. Clone repo:
   ```bash
   git clone YOUR_CLIENT_REPO_LINK
   cd medi-camp-client
   npm install
   REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
   REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
   REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   REACT_APP_API_BASE_URL=YOUR_BACKEND_API_URL
   npm start
   npm run build
 ```
 Developed with ❤️ by [Refat Khan]