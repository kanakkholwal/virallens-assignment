# ViralLens AI Customer Support Chat System

A production-quality AI customer support chat system built with React, Express, MongoDB, and OpenRouter AI.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Mongoose, JWT, bcrypt.
- **Database**: MongoDB.
- **AI**: OpenRouter (Gemini 2.0 Flash Exp).
- **DevOps**: Docker, Docker Compose.

## Features

- User Authentication (Signup/Login) with JWT.
- Secure AI Chat Module (OpenRouter).
- Optimistic UI for smooth chatting.
- Auto-scrolling chat history.
- Persistent Chat History in MongoDB.
- Containerized for easy deployment.

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Docker and Docker Compose
- OpenRouter API Key

### Local Development

1. **Clone the repository**
2. **Setup Backend**:
   - `cd server`
   - `npm install`
   - Create `.env` from `.env.example` and add your `OPENROUTER_API_KEY` and `JWT_SECRET`.
   - `npm run dev`
3. **Setup Frontend**:
   - `cd client`
   - `npm install`
   - Create `.env` from `.env.example`.
   - `npm run dev`

### Run with Docker

1. Create a `.env` file in the **root** directory (or passed via environment) with:
   ```env
   JWT_SECRET=your_jwt_secret
   OPENROUTER_API_KEY=your_api_key
   ```
2. Build and run:
   ```bash
   docker compose up --build
   ```
3. Access the app at `http://localhost`.

## API Routes

### Auth
- `POST /auth/signup`: Create a new user account.
- `POST /auth/login`: Authenticate user and receive JWT.

### Chat
- `POST /chat/send`: Send a message to AI and store history.
- `GET /chat/history`: Retrieve user-specific chat history.

## Architecture Decisions

- **Tailwind CSS v4**: Used for modern, fast styling without configuration overhead.
- **Optimistic UI**: Messages are added to the UI immediately before the server responds to ensure a responsive feel.
- **Modular Backend**: Separated into modules (auth, chat) for scalability and maintainability.
- **Streaming**: Not used in this version for simplicity, but easily swappable in `ai.service.ts`.
- **Docker Multi-stage Builds**: Used to minimize image size for production deployment.
