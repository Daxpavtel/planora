# Planora (GlobeTrotter)

Planora is an intelligent travel planning platform designed to make trip organization effortless and collaborative. 

## Features
- **Smart Budgeting:** Automatically estimates costs for flights, stays, dining, and activities based on travel style and duration.
- **Dynamic Itinerary Builder:** Plan out your days, assign activities, and adjust your pace.
- **Real-time Collaboration:** Share trips with friends and plan together.
- **Interactive Maps:** Visualize your route and city stops.

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MySQL (TiDB Cloud)
- **Deployment:** Vercel (Frontend), Render (Backend)

## Environment Variables

### Frontend (\.env.local\)
\\\env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
\\\

### Backend (\ackend/.env\)
\\\env
PORT=5000
JWT_SECRET=your_jwt_secret
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=sys
\\\

## Getting Started

1. Clone the repository
2. Install frontend dependencies: \cd frontend && npm install\
3. Install backend dependencies: \cd backend && npm install\
4. Start the backend: \
pm run dev\ (inside backend folder)
5. Start the frontend: \
pm run dev\ (inside frontend folder)

## License
MIT
