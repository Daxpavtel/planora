# Planora Architecture

## Overview
Planora is a personalized multi-city travel planning platform. The repository is organized as a monorepo containing a frontend and a backend workspace.

## Frontend
The frontend is a Next.js (App Router) application.
- src/app: Contains Next.js routes.
- src/components: Contains global/shared components (UI primitives, layout, etc.).
- src/features: Organized by domain logic (trips, destinations, budget, etc.). Contains feature-specific components, hooks, and services.
- src/services: API abstraction layer and mock data.
- src/types: Domain models for API contracts.

## API Layer
All API calls from the frontend should go through domain services (e.g., tripService.ts). Raw fetch calls are forbidden in UI components. The services communicate with the backend using the apiClient.

## Backend
The backend is prepared for Node.js/Express.
- src/routes: API endpoints definition.
- src/controllers: Request/response handling.
- src/services: Business logic.
- src/validators: Request validation schemas.

## Database
We will use a relational database (PostgreSQL + Prisma or similar).
Entities map exactly to domain models defined in frontend/src/types/models.ts.

## Authentication
Authentication will be handled via JWT. The frontend will pass the token in an Authorization header via apiClient. The backend will decode this to authenticate users.

## Data Flow
UI Component -> Feature Service -> API Client -> Backend Route -> Controller -> Backend Service -> Database Repository.