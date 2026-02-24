# ViralLens AI Customer Support Chat System

A production-ready, full-stack AI customer support chat application built with modern web technologies. This system provides a seamless chat experience with persistent history, secure authentication, and AI-powered responses.

---

## 🏗️ Project Structure

```text
virallens/
├── client/             # React + Vite Frontend
│   ├── src/            # Components, Hooks, Context, Services
│   └── Dockerfile      # Frontend Production Build
├── server/             # Node.js + Express + Bun Backend (TypeScript)
│   ├── src/            # Controllers, Models, Routes, Services
│   └── Dockerfile      # Backend Production Build
├── docker-compose.yml  # Production Orchestration (w/ Mongo Auth)
└── docker-compose.dev.yml # Development Orchestration (w/ Hot Reload)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animations**: [Streamdown](https://github.com/streamdown/streamdown) for AI response rendering.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) / [Bun](https://bun.sh/)
- **API Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT](https://jwt.io/) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **AI Integration**: [OpenRouter](https://openrouter.ai/) (liquid/lfm-2.5-1.2b-instruct:free)

---

## 🚀 Quick Start (Docker)

The easiest way to get the system running is using Docker Compose.

### 1. Setup Environment
Create a `.env` file in the **root** of the project:

```env
JWT_SECRET=your_super_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Run the Application

**For Production-like environment:**
```bash
docker compose up --build
```
- Frontend: `http://localhost:4173`
- Backend: `http://localhost:8080`

**For Development (with hot-reload):**
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Frontend: `http://localhost:4173`
- Backend: `http://localhost:8080`

---

## 💻 Manual Local Setup

If you prefer to run the services manually without Docker:

### 1. Prerequisites
- **Node.js**: v20+ or **Bun** v1.1+
- **MongoDB**: Running locally at `mongodb://localhost:27017`

### 2. Backend Setup
```bash
cd server
npm install
# or
bun install

# Configure server/.env
cp .env.example .env

# Run development server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# or
bun install

# Configure client/.env
cp .env.example .env

# Run development server
npm run dev
```

---

## 🔑 Environment Variables

### Server (`/server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `8080` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://...` |
| `JWT_SECRET` | Secret for signing JWTs | *Required* |
| `OPENROUTER_API_KEY` | Your OpenRouter API Key | *Required* |
| `AI_MODEL` | AI model to use | `liquid/lfm-2.5-1.2b-instruct:free` |

### Client (`/client/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080` |

---

## 📡 API Overview

### Documentation & Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Login and get JWT token | No |
| `GET` | `/chat/history`| Fetch chat history | Yes |
| `POST` | `/chat/send` | Send message to AI | Yes |

---

## ✨ Features & Design Choices

- **Optimistic UI Updates**: Chat messages appear instantly in the UI for a snappy feel, sync with backend happens in the background.
- **Auto-scroll Experience**: Chat automatically scrolls to the latest message.
- **Robust Authentication**: Secure password hashing with bcrypt and token-based sessions with JWT.
- **Rate Limiting**: Backend protected by IP-based rate limits to prevent AI API abuse.
- **Responsive Design**: Fully responsive UI tailored for both desktop and mobile users.
- **Modern Styling**: Leveraging Tailwind CSS v4's latest features for a clean, professional look.
