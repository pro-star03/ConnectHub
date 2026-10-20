# ConnectHub — Modern Full-Stack Social Networking & Community Platform

A full-featured MERN stack social media platform enabling users to connect, share moments, chat in real-time, share 24-hour ephemeral stories, and manage community interactions with a powerful dedicated Admin Dashboard.

## Features
1. **User Authentication & Profiles** — Secure registration & login with JWT + BCrypt, editable bio, headline, avatar, and follower/following stats.
2. **Dynamic Social Feed & Posts** — Create rich multimedia posts with base64 image uploads, hashtags, captions, like/react, and bookmark/save.
3. **Interactive Comment System** — Multi-level comment threads, likes on comments, and real-time conversation updates.
4. **24-Hour Ephemeral Stories** — Post photo & text stories with customizable gradient backgrounds, automatic 24-hour expiration, and real-time viewer tracking.
5. **Real-Time Direct Messaging (Socket.IO)** — Instant 1-on-1 private messaging, typing indicators, active status, message reactions, and media sharing.
6. **Follow & Social Graph** — Follow/unfollow users, view interactive followers/following lists, and get smart recommendations in "Suggested for you".
7. **User Safety & Blocking** — Block/unblock accounts to restrict feed visibility and interactions, with a dedicated Blocked Users management page.
8. **Reporting & Feedback Center** — User-initiated reporting system for inappropriate posts or accounts, plus platform feedback submission.
9. **Real-Time Notification System** — Instant socket-driven alerts for likes, comments, follows, messages, and administrative actions.
10. **Explore & Global Search** — Search users and content in real-time with responsive debounced query filtering.
11. **Comprehensive Admin Dashboard** — System analytics KPIs, user management (ban, suspend, verify, role promotion), content moderation, and active story oversight.
12. **Fixed System Admin Safeguard** — Automated root admin account provisioning and credential synchronization on startup.

## Design
ConnectHub is crafted with a modern, high-contrast visual design powered by **Tailwind CSS v4** and **DaisyUI 5**. The interface incorporates glassmorphism overlays, fluid transitions, responsive layouts (collapsible left navigation sidebar, center feed, right widgets, and bottom navigation for mobile viewports), interactive modal dialogs, and smooth micro-interactions.

## Project Structure
```
ConnectHub01/
├── backend/                              → Node.js + Express + MongoDB REST API & Socket.IO
│   ├── src/
│   │   ├── config/
│   │   │   ├── adminConfig.js            → Root admin provisioning & synchronization
│   │   │   └── db.js                     → MongoDB Mongoose connection handler
│   │   ├── controllers/
│   │   │   ├── adminController.js        → Admin dashboard, metrics & moderation
│   │   │   ├── authController.js         → Register, login, password updates
│   │   │   ├── commentController.js      → Post comments and reply operations
│   │   │   ├── messageController.js      → Chat history & 1-on-1 messages
│   │   │   ├── notificationController.js → User alerts and status updates
│   │   │   ├── postController.js         → Feed, create, like, and save posts
│   │   │   ├── reportController.js       → Report handling for abuse/spam
│   │   │   ├── storyController.js        → 24h stories & viewer statistics
│   │   │   └── userController.js         → User profiles, follow graph & block list
│   │   ├── middleware/
│   │   │   └── authMiddleware.js         → JWT verification & admin authorization
│   │   ├── models/
│   │   │   ├── ActivityLog.js            → Admin audit trails & platform logs
│   │   │   ├── Comment.js                → Comment schema with nested likes
│   │   │   ├── Feedback.js               → User reviews & platform feedback
│   │   │   ├── Message.js                → Real-time chat messages
│   │   │   ├── Notification.js           → Activity notifications
│   │   │   ├── Post.js                   → Post media, tags, likes & bookmarks
│   │   │   ├── Report.js                 → Content moderation reports
│   │   │   ├── Story.js                  → 24h ephemeral story schema
│   │   │   ├── StoryView.js              → Story views tracking schema
│   │   │   ├── SystemSetting.js          → Dynamic site settings
│   │   │   └── User.js                   → User profiles, followers & security
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── storyRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── seed.js                       → Database initialization & mock seed script
│   │   ├── server.js                     → Express app, HTTP server & database boot
│   │   └── socket.js                     → Socket.IO connection & real-time events
│   ├── .env                              → Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json
│   ├── seed_26_indian_users.js           → Regional profile test seeder
│   └── seed_55_users.js                  → Scaled test users & content seeder
├── frontend/                             → React 19 + Vite Single Page Application
│   ├── public/                           → Static assets and logos
│   ├── src/
│   │   ├── components/                   → Reusable UI components
│   │   │   ├── AdminRoute.jsx            → Admin authorization route guard
│   │   │   ├── BottomNavigation.jsx      → Mobile-friendly bottom tab bar
│   │   │   ├── CreatePostBox.jsx         → Inline feed post creator modal
│   │   │   ├── Navbar.jsx                → Top header search & notification icons
│   │   │   ├── PostCard.jsx              → Feed item card with interactions & comments
│   │   │   ├── ProtectedRoute.jsx        → Authenticated route guard
│   │   │   ├── RightSidebar.jsx          → Trending tags & user suggestions
│   │   │   ├── Sidebar.jsx               → Desktop left navigation sidebar
│   │   │   ├── Stories.jsx               → Horizontal story bubbles carousel
│   │   │   └── StoryViewer.jsx           → Fullscreen story modal with auto-play
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           → Authentication state & user session
│   │   │   └── SocketContext.jsx         → Socket.IO client instance & event listeners
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx           → Dedicated administrative layout with sidebar
│   │   │   └── MainLayout.jsx            → Standard app layout with sidebar & bottom bar
│   │   ├── pages/
│   │   │   ├── admin/                    → Admin Control Panel Views
│   │   │   │   ├── AdminDashboard.jsx    → Overview stats, KPI charts & quick actions
│   │   │   │   ├── AdminFeedback.jsx     → Review user platform feedback
│   │   │   │   ├── AdminLogin.jsx        → Dedicated administrative sign-in
│   │   │   │   ├── AdminPosts.jsx        → Moderation view for reported & all posts
│   │   │   │   ├── AdminReports.jsx      → User reports & dispute resolution
│   │   │   │   ├── AdminSettings.jsx     → Global platform configuration
│   │   │   │   ├── AdminStories.jsx      → Active story oversight & instant removal
│   │   │   │   ├── AdminSuspiciousUsers.jsx → Flagged & high-activity account audits
│   │   │   │   └── AdminUsers.jsx        → User management, roles & ban/suspend
│   │   │   ├── BlockedUsers.jsx          → List & unblock restricted users
│   │   │   ├── ChangePassword.jsx        → Account security page
│   │   │   ├── CreateOptions.jsx         → Choice modal between Post or Story
│   │   │   ├── CreatePost.jsx            → Standalone post creation view
│   │   │   ├── CreateStory.jsx           → Story editor with gradient & text tools
│   │   │   ├── Dashboard.jsx             → Personal activity dashboard
│   │   │   ├── Home.jsx                  → Primary social feed & stories
│   │   │   ├── Login.jsx                 → Sign-in page
│   │   │   ├── Messages.jsx              → Real-time chat interface & conversations
│   │   │   ├── Notifications.jsx         → User activity alerts page
│   │   │   ├── PostDetails.jsx           → Single post deep link with full comments
│   │   │   ├── Profile.jsx               → User profile, bio, followers & post grid
│   │   │   ├── Register.jsx              → Sign-up page
│   │   │   ├── SavedPosts.jsx            → Bookmarked posts collection
│   │   │   ├── Search.jsx                → Discover users and search posts
│   │   │   ├── Settings.jsx              → Account settings & privacy controls
│   │   │   └── Suggestions.jsx           → Recommended users to follow
│   │   ├── services/                     → Modular Axios API client services
│   │   │   ├── adminService.js
│   │   │   ├── api.js                    → Central Axios instance & token interceptors
│   │   │   ├── authService.js
│   │   │   ├── commentService.js
│   │   │   ├── messageService.js
│   │   │   ├── notificationService.js
│   │   │   ├── postService.js
│   │   │   ├── reportService.js
│   │   │   ├── storyService.js
│   │   │   └── userService.js
│   │   ├── utils/
│   │   │   ├── dateFormatter.js          → Relative time & timestamp formatting
│   │   │   └── imageToBase64.js          → Client-side file to base64 converter
│   │   ├── App.jsx                       → App routes & layout mappings
│   │   ├── index.css                     → Tailwind CSS & DaisyUI theme variables
│   │   └── main.jsx                      → React DOM root mount
│   ├── .env                              → Frontend environment configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                    → Vite configuration with API proxy
├── .gitignore
├── package.json                          → Root workspace runner (concurrently)
└── README.md
```

## Setup

### Prerequisites
- **Node.js**: v18+ (Node.js v20+ recommended)
- **MongoDB**: MongoDB Atlas Cluster connection or local MongoDB instance

---

### 1. Root Installation (All-in-One)
You can install dependencies and run both servers simultaneously from the root directory:
```bash
# Install root dependencies
npm install

# Install both backend and frontend dependencies in one command
npm run build
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Run the backend development server:
```bash
npm run dev
```
Backend runs on `http://localhost:5000`

> **Default Admin Account:**
> The backend automatically provisions a fixed root administrator account on startup:
> - **Email:** `alok@gmail.com`
> - **Password:** `1234567890`

---

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=/api
```

Start the Vite development server:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173` (with `/api` automatically proxied to `http://localhost:5000`).

---

### 4. Running Both Concurrently
From the project root:
```bash
npm run dev
```
This boots both the backend API (`http://localhost:5000`) and the Vite frontend (`http://localhost:5173`) simultaneously.

---

### 5. Seed Mock Data (Optional)
To quickly populate your database with test users, posts, and social interactions:
```bash
# Basic seed script
npm run seed

# Or run detailed user population scripts
node backend/seed_26_indian_users.js
node backend/seed_55_users.js
```

---

## Testing APIs (Postman / cURL)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/posts` | Fetch home timeline feed | Yes (Bearer Token) |
| `POST` | `/api/posts` | Create a new post with image & caption | Yes (Bearer Token) |
| `POST` | `/api/posts/:id/like` | Like or unlike a post | Yes (Bearer Token) |
| `POST` | `/api/comments/:postId` | Add a comment to a post | Yes (Bearer Token) |
| `POST` | `/api/stories` | Upload a new 24-hour story | Yes (Bearer Token) |
| `GET` | `/api/stories` | Retrieve active stories from followed users | Yes (Bearer Token) |
| `GET` | `/api/messages/:userId` | Get 1-on-1 chat history with a user | Yes (Bearer Token) |
| `POST` | `/api/messages` | Send a direct message | Yes (Bearer Token) |
| `POST` | `/api/users/:id/follow` | Follow or unfollow a user | Yes (Bearer Token) |
| `POST` | `/api/users/:id/block` | Block or unblock a user | Yes (Bearer Token) |
| `GET` | `/api/users/blocked/list` | Retrieve list of blocked users | Yes (Bearer Token) |
| `GET` | `/api/admin/stats` | Retrieve platform KPI metrics | Yes (Admin Role) |
| `GET` | `/api/admin/users` | Manage and filter platform users | Yes (Admin Role) |

---

## Deployment (Free Tier Guide)

| Component | Recommended Platform | Notes |
|---|---|---|
| **Database** | MongoDB Atlas | Free M0 sandbox cluster, enable `0.0.0.0/0` in Network Access |
| **Backend API** | Render / Railway | Set Node environment to production and define `MONGO_URI` & `JWT_SECRET` |
| **Frontend SPA** | Vercel / Netlify | Set build command `npm run build` and output directory `dist` |

Before deploying the frontend, update `VITE_API_URL` in `frontend/.env` to point to your live backend domain (e.g. `https://your-backend.onrender.com/api`).

---

## Tech Stack
- **Frontend**: React 19, React Router v7, Tailwind CSS v4, DaisyUI 5, Lucide React, Heroicons, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO (WebSockets)
- **Database**: MongoDB Atlas + Mongoose
- **Authentication**: JSON Web Tokens (JWT) + BCrypt.js
- **Build & Dev Tooling**: Vite, Nodemon, Concurrently
