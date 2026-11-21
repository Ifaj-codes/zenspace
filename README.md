# ZenSpace: Unified Minimalist Productivity Web Platform

> **CSE 324 – Web Technologies Sessional Term Project**  
> **Institution:** Bangladesh Army International University of Science and Technology (BAIUST), Cumilla  
> **Student:** Nesar Uddin Ifag | **Student ID:** 1119004 | **Department:** Computer Science & Engineering  
> **Supervisor/Instructor:** Yeakob Ali, Lecturer  

---

## 📖 Executive Summary & Motivation

Managing university coursework, laboratory submissions, examination schedules, and personal revision notes typically forces students to juggle disparate, fragmented web tools. Mainstream platforms (Notion, ClickUp, Jira) are often bogged down by corporate collaboration overhead and complex database setups, while single-purpose to-do or note apps lack interconnected schedule context.

**ZenSpace** addresses this research gap by providing a **unified, distraction-free, three-tier academic productivity web platform** combining:
1. **Interactive Calendar Management** (Monthly & Weekly views with color-coded academic categories: Lecture, Lab, Exam, Assignment, Personal).
2. **Priority-Based Task Tracking** (High, Medium, Low priority levels, due date tracking, and 1-click completion toggles).
3. **Personal Note Management** (Lightweight rich Markdown note editor with tag-based search and chronological ordering).
4. **Task–Calendar Synchronization (Core Feature)**: Automatically maps task deadlines as glowing priority highlights directly onto the calendar grid, keeping scheduling and execution unified.
5. **Clutter-Free Minimalist UI**: Zen-inspired Japanese aesthetic with crisp typography, dark/light appearance mode, and responsive layout.

---

## 🏛️ System Architecture: Three-Tier Client-Server

ZenSpace strictly follows the **Three-Tier Client-Server Architecture** specified in the proposal:

```
+-------------------------------------------------------------------------+
|                      PRESENTATION TIER (Client Side)                     |
|  - Next.js 14 / React 18 / Tailwind CSS / Lucide Modern Icons           |
|  - Unified Dashboard, Monthly/Weekly Calendar, Priority Kanban Task     |
|    Board, Rich Markdown Note Editor, Dark/Light Appearance Mode         |
+-------------------------------------------------------------------------+
                                   ▲
                                   │  HTTP / RESTful JSON APIs (JWT Auth)
                                   ▼
+-------------------------------------------------------------------------+
|                     APPLICATION TIER (Server Side)                      |
|  - Node.js & Express.js REST API Server                                 |
|  - JWT Authentication Middleware & bcrypt.js Password Hashing           |
|  - Task-Calendar Synchronization Engine                                 |
|  - Data Validation & Error Handling Layer                               |
+-------------------------------------------------------------------------+
                                   ▲
                                   │  Mongoose ODM / MongoDB Driver
                                   ▼
+-------------------------------------------------------------------------+
|                        DATA TIER (Database)                             |
|  - MongoDB Atlas Cloud Database / Local MongoDB via Mongoose            |
|  - Embedded Zero-Config Persistent Fallback Engine (for instant demos)  |
|  - Collections: Users, Events, Tasks, Notes                             |
+-------------------------------------------------------------------------+
```

---

## 🗄️ Database Design (Conceptual ER Model)

- **User**: `_id`, `name`, `email`, `passwordHash`, `studentId`, `department`, `createdAt`
- **Event**: `_id`, `userId` (FK), `title`, `description`, `date` (YYYY-MM-DD), `startTime`, `endTime`, `category` (`Lecture` | `Exam` | `Assignment` | `Lab` | `Personal`), `location`, `createdAt`
- **Task**: `_id`, `userId` (FK), `title`, `description`, `priority` (`High` | `Medium` | `Low`), `dueDate` (YYYY-MM-DD), `status` (`pending` | `completed`), `courseCode`, `createdAt`, `completedAt`
- **Note**: `_id`, `userId` (FK), `title`, `content` (Markdown), `tags` (`String[]`), `isPinned` (`Boolean`), `color`, `createdAt`, `updatedAt`

---

## ⚡ Task–Calendar Synchronization (Highlight Feature)

Whenever an academic task is created or updated with a target due date:
- It **automatically synchronizes** into the calendar dataset.
- In **Month View**, deadlines display with distinctive status pills and priority badges (`🔴 High Priority`, `🟡 Medium`, `🟢 Low`).
- In **Week View**, deadlines appear chronologically alongside scheduled lectures and laboratory sessions.
- Clicking the task checkbox directly inside the calendar updates its status to **completed** across both the task board and calendar view simultaneously.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** v9+
- *(Optional)* MongoDB Atlas connection string or local MongoDB instance (the application includes an embedded zero-config persistent database layer so it works out-of-the-box even without MongoDB running!).

### 2. Installation
From the root `zenspace` directory:
```bash
# Install root dependencies
npm install

# Install all sub-tier dependencies (backend & frontend)
npm run install:all
```

### 3. Run the Full-Stack Application
Start both the Express backend API (`http://localhost:5000`) and Next.js frontend (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 🔑 Demo Account & 1-Click Login

ZenSpace comes pre-populated with realistic academic data for **Nesar Uddin Ifag (ID: 1119004)**. On the login page, you can simply click:

👉 **"1-Click Login as Demo Student"**

Or sign in manually with:
- **Email:** `student@baiust.edu.bd`
- **Password:** `password123`

You can also register a brand new student account at `/register`.

---

## 📡 RESTful API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student account (hashes password with bcrypt)
- `POST /api/auth/login` - Authenticate student and issue signed JWT token
- `GET /api/auth/me` - Retrieve authenticated user profile (JWT protected)
- `POST /api/auth/reseed` - Reset demo academic dataset

### 📋 Priority Tasks (`/api/tasks`)
- `GET /api/tasks` - List tasks (query filters: `priority`, `status`, `search`)
- `POST /api/tasks` - Create task (`title`, `priority`, `dueDate`, `courseCode`)
- `PUT /api/tasks/:id` - Update task details
- `PATCH /api/tasks/:id/toggle` - Quick toggle between `pending` and `completed`
- `DELETE /api/tasks/:id` - Remove task

### 📅 Calendar Events (`/api/events`)
- `GET /api/events` - Retrieve calendar events (query filters: `month`, `category`)
- `POST /api/events` - Schedule new event (`Lecture`, `Lab`, `Exam`, `Assignment`, `Personal`)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### 📝 Notes & Cheatsheets (`/api/notes`)
- `GET /api/notes` - List notes (query filters: `tag`, `search`)
- `POST /api/notes` - Create rich note with Markdown, tag array, and pinned status
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### 🔄 Synchronization & Overview (`/api/sync`)
- `GET /api/sync/calendar` - Unified calendar stream combining events + task deadlines
- `GET /api/sync/overview` - Academic KPI dashboard metrics & upcoming 7-day deadlines

---

## ☁️ Cloud Deployment Configuration

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import `frontend/` directory into [Vercel](https://vercel.com).
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`.

### Backend (Render)
1. Import `backend/` directory into [Render](https://render.com) as a Web Service.
2. Build command: `npm install` | Start command: `node server.js`.
3. Set environment variables:
   - `PORT=5000`
   - `JWT_SECRET=your_secure_secret_key`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zenspace`
