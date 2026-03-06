# 🚀 SB Stocks — Paper Trading Platform

A full-stack MERN application for simulated US stock market trading with virtual funds.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## ✨ Features
- 🔐 JWT-based authentication & role-based access control
- 💰 $100,000 virtual balance for paper trading
- 📈 Buy & sell stocks with real-time simulated prices
- 📊 Portfolio tracking with P&L analytics
- ❤️ Watchlist for monitoring favorite stocks
- 📋 Complete transaction history
- 🛡️ Admin panel for managing users and stocks
- 📱 Responsive light-theme UI

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Redux Toolkit, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| Charts | Chart.js + react-chartjs-2 |
| Styling | Custom CSS (light theme) |

---

## 📦 Prerequisites

Install the following before starting:

1. **Node.js v16+** — https://nodejs.org
   ```
   node --version   # Should be v16.0.0 or higher
   npm --version    # Should be v8.0.0 or higher
   ```

2. **MongoDB** (one of these options):
   - **Local:** Download from https://www.mongodb.com/try/download/community
   - **Cloud (recommended):** Create a free cluster at https://cloud.mongodb.com

3. **Git** — https://git-scm.com (optional, for version control)

---

## 🔧 Step-by-Step Setup

### Step 1: Extract the Project

Unzip `sbstocks.zip` to your preferred location:
```
unzip sbstocks.zip -d sbstocks
cd sbstocks
```

You should see:
```
sbstocks/
├── backend/
├── frontend/
└── README.md
```

---

### Step 2: Backend Setup

#### 2a. Navigate to backend folder
```bash
cd backend
```

#### 2b. Install dependencies
```bash
npm install
```

#### 2c. Create environment file
Copy the example env file:
```bash
cp .env.example .env
```

Then open `.env` and configure:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sbstocks
JWT_SECRET=sbstocks_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

> **For MongoDB Atlas (Cloud):**
> Replace MONGO_URI with your Atlas connection string:
> `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sbstocks`

#### 2d. Seed the admin user
```bash
node scripts/seed.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Admin user created: admin@sbstocks.com / admin123
✅ Seeding complete!
```

---

### Step 3: Frontend Setup

Open a **new terminal window** and navigate to the frontend:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

> **Note:** The frontend is pre-configured to proxy API requests to `http://localhost:5000`.
> No additional configuration needed for local development.

---

## ▶️ Running the Application

### Start the Backend Server

In the `backend/` directory:
```bash
# Production mode
npm start

# Development mode (auto-restarts on file changes)
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected
```

### Start the Frontend

In the `frontend/` directory (new terminal):
```bash
npm start
```

The React app will open automatically at: **http://localhost:3000**

---

## 🔑 Default Credentials

### Admin Account
| Field | Value |
|-------|-------|
| Email | admin@sbstocks.com |
| Password | admin123 |
| Role | Admin |

> Admins can access the Admin Panel to manage stocks and users.

### Regular User
Register a new account from the **Sign Up** page.
- Every new user starts with **$100,000 virtual balance**

---

## 🌱 Seeding Stock Data

After logging in as Admin:

1. Go to **Admin Panel** → **Stocks** tab
2. Click **"🌱 Seed Stocks"** button
3. This will add 20 pre-defined US stocks (AAPL, MSFT, GOOGL, NVDA, TSLA, etc.)

Alternatively, use the API:
```bash
curl -X POST http://localhost:5000/api/admin/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login | No |
| GET | /auth/me | Get current user | Yes |
| PUT | /auth/profile | Update profile | Yes |

#### Stocks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /stocks | List all stocks (with search/filter) | Yes |
| GET | /stocks/:symbol | Get stock by symbol | Yes |
| GET | /stocks/sectors/list | Get all sectors | Yes |
| GET | /stocks/refresh/prices | Refresh simulated prices | Yes |

#### Transactions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /transactions/buy | Buy a stock | Yes |
| POST | /transactions/sell | Sell a stock | Yes |
| GET | /transactions | Get transaction history | Yes |

#### Portfolio
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /portfolio | Get portfolio with live P&L | Yes |

#### Watchlist
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /watchlist | Get user's watchlist | Yes |
| POST | /watchlist/:symbol | Add stock to watchlist | Yes |
| DELETE | /watchlist/:symbol | Remove from watchlist | Yes |

#### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/dashboard | Dashboard stats |
| GET | /admin/users | List all users |
| PUT | /admin/users/:id/toggle | Activate/deactivate user |
| GET | /admin/stocks | List stocks |
| POST | /admin/stocks | Create stock |
| PUT | /admin/stocks/:id | Update stock |
| DELETE | /admin/stocks/:id | Deactivate stock |
| POST | /admin/seed | Seed default stocks |

---

## 📁 Project Structure

```
sbstocks/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Registration, login, profile
│   │   ├── stockController.js    # Stock listing and price simulation
│   │   ├── transactionController.js # Buy/sell logic
│   │   ├── portfolioController.js   # Portfolio with live P&L
│   │   ├── watchlistController.js   # Watchlist CRUD
│   │   └── adminController.js    # Admin operations
│   ├── middleware/
│   │   └── auth.js              # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js              # User schema (bcrypt password)
│   │   ├── Stock.js             # Stock schema with price history
│   │   ├── Portfolio.js         # Portfolio holdings
│   │   ├── Transaction.js       # Trade records
│   │   └── Watchlist.js         # User watchlist
│   ├── routes/
│   │   ├── auth.js
│   │   ├── stocks.js
│   │   ├── transactions.js
│   │   ├── portfolio.js
│   │   ├── watchlist.js
│   │   └── admin.js
│   ├── scripts/
│   │   └── seed.js              # Admin user seeder
│   ├── .env                     # Environment variables (create this)
│   ├── .env.example             # Example env file
│   ├── package.json
│   └── server.js                # Express server entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Layout.jsx           # App shell with sidebar
│   │   │       ├── Sidebar.jsx          # Navigation sidebar
│   │   │       └── ProtectedRoute.jsx   # Route guards
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Stocks.jsx       # Market listing + trade modal
│   │   │   ├── Portfolio.jsx    # Holdings + P&L
│   │   │   ├── Transactions.jsx # Trade history
│   │   │   ├── Watchlist.jsx    # Watched stocks
│   │   │   ├── Admin.jsx        # Admin panel
│   │   │   └── Profile.jsx      # User settings
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   ├── utils/
│   │   │   ├── api.js           # Axios instance with interceptors
│   │   │   └── format.js        # Currency, date formatters
│   │   ├── styles/
│   │   │   └── global.css       # Complete light theme styles
│   │   ├── App.js               # Root with routing
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## 🐛 Troubleshooting

### MongoDB connection failed
- Ensure MongoDB service is running: `sudo service mongod start`
- Check your MONGO_URI in `.env`
- For Atlas: whitelist your IP in Network Access settings

### Port already in use
```bash
# Kill process on port 5000
lsof -i :5000 | awk 'NR>1 {print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9
```

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check the `"proxy": "http://localhost:5000"` in `frontend/package.json`
- Restart the frontend after any proxy changes

### npm install fails
```bash
npm install --legacy-peer-deps
```

---

## 📄 License

This project is for educational purposes. Built with ❤️ using the MERN stack.
