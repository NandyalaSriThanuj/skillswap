# ⚡ SkillSwap — Skill Barter Platform
### A full-stack dark-themed web app combining SkillSwap (API-driven exchanges) + SkillBarter (dark UI, coins, leaderboard, skill exams)

---

## 🎨 Design System
Inspired by **barter.html** — dark cyberpunk aesthetic:
- **Background:** `#0a0a0f` with purple grid noise overlay
- **Fonts:** Clash Display (headings) + Space Grotesk (body) + JetBrains Mono (code/coins)
- **Palette:** `#6c63ff` accent · `#ff6b6b` red · `#43e97b` green · `#ffd700` gold
- **Components:** Glass-morphism cards, gradient buttons, animated modals

---

## 🗂️ Project Structure

```
skillswap/
├── backend/                      # Node.js + Express API
│   ├── config/database.js        # PostgreSQL pool
│   ├── controllers/              # authController, userController, exchangeController,
│   │                             #   messageController, adminController
│   ├── middleware/auth.js        # JWT + admin guard
│   ├── routes/                   # auth, users, exchanges, messages, admin
│   ├── schema.sql                # DB schema + 30 seed skills
│   ├── server.js                 # Express + Socket.IO entry point
│   └── .env.example
│
└── frontend/                     # React 18 application
    └── src/
        ├── components/shared/
        │   ├── UI.jsx            # All reusable dark-theme components
        │   │                     #   Card, BtnPrimary/Ghost/Danger/Success/Gold
        │   │                     #   Input, Select, Textarea, FormGroup, Label
        │   │                     #   Avatar, LevelBadge, SkillChip, Stars
        │   │                     #   StatusBadge, Modal, Spinner, ProgressBar
        │   ├── Navbar.jsx        # Fixed dark navbar
        │   └── UserCard.jsx      # Skill exchange user card
        ├── context/AuthContext.js
        ├── pages/
        │   ├── LandingPage.jsx   # ★ From barter.html: Hero + Explore + How It Works + Leaderboard
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx # Stats, matches, exchanges, notifications
        │   ├── ProfilePage.jsx
        │   ├── EditProfilePage.jsx  # 3-tab: info / teach / learn
        │   ├── UserProfilePage.jsx
        │   ├── SearchPage.jsx    # ★ Explore with barter.html card style + connect modal
        │   ├── ExchangesPage.jsx # List + accept/reject/complete
        │   ├── ExchangeDetailPage.jsx  # Real-time chat via Socket.IO
        │   ├── MessagesPage.jsx
        │   └── AdminPage.jsx     # Stats, users, exchanges, add skills
        └── utils/api.js
```

---

## 🚀 Quick Start

### Step 1 — Install dependencies
```bash
npm run install:all
# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### Step 2 — Set up environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/skillswap
JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 3 — Set up database

**Option A: Local PostgreSQL**
```bash
psql -U postgres -c "CREATE DATABASE skillswap;"
psql -U postgres -d skillswap -f backend/schema.sql
```

**Option B: Supabase (free cloud DB)**
1. Create project at supabase.com
2. Go to SQL Editor → paste contents of `backend/schema.sql` → Run

### Step 4 — Start everything
```bash
npm start
# Opens:  http://localhost:3000  (frontend)
#         http://localhost:5000  (backend API)
```

### Step 5 — Make yourself admin (optional)
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';
```

---

## 📄 Pages Reference

| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Dark hero, Explore, How It Works, Leaderboard (from barter.html) |
| `/login` | LoginPage | Dark auth form |
| `/signup` | SignupPage | Registration with bio + location |
| `/dashboard` | DashboardPage | Stats, matches, exchange list, notifications |
| `/profile` | ProfilePage | View own profile + skills |
| `/profile/edit` | EditProfilePage | Edit info / skills taught / skills wanted |
| `/users/:id` | UserProfilePage | View other user's profile + request exchange |
| `/search` | SearchPage | Explore users with barter.html card style |
| `/exchanges` | ExchangesPage | All exchanges with accept/decline/complete |
| `/exchanges/:id` | ExchangeDetailPage | Real-time chat + exchange management |
| `/messages` | MessagesPage | Active chats + notifications + pending requests |
| `/admin` | AdminPage | Stats, user management, exchange monitor |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (protected) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?skill=python&category=Technology` | Search users |
| GET | `/api/users/matches` | Smart skill matches |
| GET | `/api/users/skills/all` | All available skills |
| GET | `/api/users/:id` | User profile |
| PUT | `/api/users/profile` | Update profile + photo |
| POST | `/api/users/skills/offer` | Add skill to teach |
| DELETE | `/api/users/skills/offer/:id` | Remove skill offer |
| POST | `/api/users/skills/want` | Add skill to learn |
| DELETE | `/api/users/skills/want/:id` | Remove skill want |

### Exchanges
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exchanges` | Send exchange request |
| GET | `/api/exchanges` | My exchanges |
| GET | `/api/exchanges/:id` | Single exchange |
| PUT | `/api/exchanges/:id/status` | Accept/reject/complete/cancel |
| POST | `/api/exchanges/:id/rate` | Rate exchange |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:exchangeId` | Get chat messages |
| POST | `/api/messages/:exchangeId` | Send message |
| GET | `/api/messages/notifications` | Get notifications |
| PUT | `/api/messages/notifications/read` | Mark read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate |
| GET | `/api/admin/exchanges` | All exchanges |
| POST | `/api/admin/skills` | Add new skill |

---

## 🎯 Key Features Combined

| Feature | Source |
|---------|--------|
| Dark cyberpunk UI | barter.html |
| Clash Display + Space Grotesk fonts | barter.html |
| Hero landing with live stats | barter.html |
| Explore skills grid with level badges | barter.html |
| Leaderboard with gold/silver/bronze | barter.html |
| How It Works 4-step guide | barter.html |
| JWT Auth (signup/login/logout) | SkillSwap backend |
| Skill offers + wants management | SkillSwap backend |
| Smart skill matching algorithm | SkillSwap backend |
| Exchange request/accept/reject | SkillSwap backend |
| Real-time chat via Socket.IO | SkillSwap backend |
| Notifications system | SkillSwap backend |
| Rating & reviews | SkillSwap backend |
| Admin panel | SkillSwap backend |
| Profile photo upload | SkillSwap backend |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router v6 |
| Styling | Tailwind CSS + inline CSS-in-JS (dark vars) |
| Fonts | Clash Display + Space Grotesk + JetBrains Mono |
| HTTP | Axios with JWT interceptors |
| Real-time | Socket.IO client |
| Backend | Node.js + Express |
| Database | PostgreSQL (pg pool) |
| Auth | JWT + bcryptjs |
| Websockets | Socket.IO server |
| File uploads | Multer |
| Notifications | react-hot-toast (dark styled) |

---

## 🐛 Troubleshooting

**"Cannot connect to database"**
→ Check `DATABASE_URL` in `backend/.env`. Ensure PostgreSQL is running.

**Fonts not loading**
→ Requires internet connection (loaded from Google Fonts CDN).

**"Module not found: UI"**
→ Ensure you're importing from `'../components/shared/UI'`

**Socket.IO not connecting**
→ Ensure `REACT_APP_SOCKET_URL=http://localhost:5000` is set in `frontend/.env`

**Port 5000 in use**
→ Change `PORT=5001` in `backend/.env` and update `REACT_APP_API_URL` accordingly.
