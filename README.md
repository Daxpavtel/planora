# ?? Planora

> **Plan smarter. Travel better.**

Planora is a personalized multi-city travel planning platform designed to make trip organization effortless and collaborative. 

Built for the **Odoo × LDCE Ahmedabad Hackathon** (inspired by the GlobeTrotter problem statement), Planora helps users create customized trips, manage multiple destinations, organize itineraries, and visualize their travel schedules—all in one place.

---

## ?? The Problem

Planning a multi-city trip is notoriously chaotic. Travelers usually have to juggle dozens of browser tabs, copy-paste hotel links into messy spreadsheets, manually calculate currency and budgets, and struggle to coordinate with fellow travelers. 

Planora solves this by providing a unified dashboard where travelers can seamlessly stitch together destinations, automatically estimate budgets based on travel styles, and build day-by-day itineraries without the headache.

---

## ??? Tech Stack

Planora is split into two fully decoupled services: a modern React frontend and a lightweight Express API backend.

**Frontend:**
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / Shadcn UI inspired components (AppShell, Card, Button, etc.)
- **Deployment:** Vercel

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (hosted on TiDB Cloud Serverless)
- **Driver:** \mysql2\ (Raw SQL queries; *Prisma was intentionally removed in favor of lightweight SQL*)
- **Authentication:** JWT (\jsonwebtoken\) & \cryptjs\
- **Deployment:** Render

---

## ? Features

### ? Currently Implemented
- **Trip Creation Engine:** Step-by-step wizard to create trips, input destinations, set travel dates, and select travel pace (e.g., Fast-paced, Relaxed).
- **Smart Budget Estimation:** Automatically calculates feasibility alerts if a user's budget is too low for the selected cities and travel style.
- **REST API Backend:** Full Express backend wired to a highly-available TiDB MySQL database.
- **Authentication Infrastructure:** JWT-based auth middleware setup (currently bypassed for hackathon testing).

### ?? Planned / Work-in-Progress
- **Day-by-Day Itinerary Builder:** Drag and drop activities into specific days.
- **Real-time Collaboration:** Live-syncing for multiple travelers editing the same trip.
- **Interactive Maps:** Visualizing the route between city stops.

---

## ?? Getting Started (Local Development)

Because Planora is decoupled, you must run both the frontend and backend servers.

### 1. Database Setup
Create a free MySQL database on **TiDB Cloud** or run MySQL locally.

### 2. Backend Setup
\\\ash
cd backend
npm install
\\\
Create a \.env\ file in the \ackend/\ directory:
\\\env
PORT=5000
JWT_SECRET=your_super_secret_string
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=sys
\\\
Start the backend:
\\\ash
npm run dev
\\\
*The API will run on http://localhost:5000*

### 3. Frontend Setup
\\\ash
cd frontend
npm install
\\\
Create a \.env.local\ file in the \rontend/\ directory:
\\\env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
\\\
Start the frontend:
\\\ash
npm run dev
\\\
*The app will run on http://localhost:3000*

---

## ?? Deployment

- **Frontend (Vercel):** Add \NEXT_PUBLIC_API_BASE_URL=https://planora-api.onrender.com/api\ to Vercel Environment Variables.
- **Backend (Render):** Set the Build Command to \
pm install\ (ignore any old Prisma commands) and the Start Command to \
pm start\. Add your TiDB credentials to Render's Environment Variables.

---

## ?? License
This project was created for the Odoo × LDCE Ahmedabad Hackathon. 

