<div align="center">
  <h1>✈️ Planora</h1>
  <h3>Plan smarter. Travel better.</h3>
  <p>A personalized multi-city travel planning platform designed to make trip organization effortless and collaborative.</p>

  <p>
    <a href="https://planora-pjo666j0n-pateldaksh2206-2764s-projects.vercel.app/login"><strong>🔴 View Live Demo</strong></a>
  </p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/TiDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </div>
</div>

<br />

## 🎯 The Problem

Planning a multi-city trip is notoriously chaotic. Travelers usually have to juggle dozens of browser tabs, copy-paste hotel links into messy spreadsheets, manually calculate currency and budgets, and struggle to coordinate with fellow travelers. 

**Planora** solves this by providing a unified dashboard where travelers can seamlessly stitch together destinations, automatically estimate budgets based on travel styles, and build day-by-day itineraries without the headache.

Built for the **Odoo × LDCE Ahmedabad Hackathon** (inspired by the GlobeTrotter problem statement).

---

## ✨ Features

### ✅ Currently Implemented
- 🗺️ **Trip Creation Engine:** Step-by-step wizard to create trips, input destinations, set travel dates, and select travel pace.
- 💰 **Smart Budget Estimation:** Automatically calculates feasibility alerts if a user's budget is too low for the selected cities and travel style.
- 🔗 **REST API Backend:** Full Express backend wired to a highly-available TiDB Serverless MySQL database.

### 🚧 Planned / Work-in-Progress
- 📅 **Day-by-Day Itinerary Builder:** Drag and drop activities into specific days.
- 👥 **Real-time Collaboration:** Live-syncing for multiple travelers editing the same trip.
- 📍 **Interactive Maps:** Visualizing the route between city stops.

---

## 🏗️ Architecture

Planora is split into two fully decoupled services:

1. **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn UI components. Deployed on **Vercel**.
2. **Backend:** Node.js, Express.js, mysql2 driver (Raw SQL). Deployed on **Render**.

---

## 🚀 Local Development

To run this project locally, you must spin up both the frontend and backend servers.

<details>
<summary><strong>1. Database Setup</strong></summary>

Create a free MySQL database on **TiDB Cloud** or run MySQL locally. You will need your host, port, username, and password for the next step.
</details>

<details>
<summary><strong>2. Backend Setup</strong></summary>

`ash
cd backend
npm install
`
Create a .env file in the ackend/ directory:
`env
PORT=5000
JWT_SECRET=your_super_secret_string
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=sys
`
Start the backend:
`ash
npm run dev
`
*The API will run on http://localhost:5000*
</details>

<details>
<summary><strong>3. Frontend Setup</strong></summary>

`ash
cd frontend
npm install
`
Create a .env.local file in the rontend/ directory:
`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
`
Start the frontend:
`ash
npm run dev
`
*The web app will run on http://localhost:3000*
</details>

---

## ☁️ Deployment Guides

- **Frontend (Vercel):** Add NEXT_PUBLIC_API_BASE_URL to Vercel Environment Variables pointing to your Render backend URL.
- **Backend (Render):** Set the Build Command to 
pm install and the Start Command to 
pm start. Add your TiDB credentials to Render's Environment Variables.

---

<div align="center">
  <p>Built with ❤️ for the Odoo × LDCE Hackathon</p>
</div>