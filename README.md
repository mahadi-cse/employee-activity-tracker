# Work Tracker System

A real-time employee work activity monitoring system consisting of a Chrome Extension for tracking, a Node.js API for data management, and a Next.js Dashboard for administrative oversight.

## 🚀 Features

- **Real-Time Tracking**: Automatic idle detection (system-wide) with a 15-second sensitivity.
- **Admin Dashboard**: Beautiful dark-mode dashboard with real-time status badges (Working/Idle/Offline).
- **Session Grouping**: Fragments of activity are automatically grouped into meaningful sessions.
- **Visual Timeline**: A daily "Heatmap" bar showing the rhythm of an employee's day.
- **30-Day History**: Detailed daily totals including active work time and idle duration.
- **Secure Tokens**: Unique employee tokens with one-click copy functionality.

## 🏗️ Architecture

- **Extension**: Vanilla JavaScript (Manifest V3) using `chrome.idle` and `chrome.storage`.
- **Server**: Node.js, Express, Prisma ORM, and PostgreSQL.
- **Client**: Next.js 15 (App Router) with a premium CSS-driven UI.

## 🛠️ Setup Instructions

### 1. Server Setup
```bash
cd server
npm install
# Configure your DATABASE_URL in a .env file
npx prisma db push
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

### 3. Extension Installation
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** (top right).
3. Click **Load Unpacked**.
4. Select the `extension` folder in this repository.
5. Click the extension icon and enter the token generated from the Admin Dashboard.

## 📊 Administrative Access
The dashboard is accessible at `http://localhost:3000/dashboard`. 
- **Add Employee**: Create a new user and copy their unique token.
- **Monitor**: Watch the live status update as employees move between Active and Idle states.
- **Analyze**: Click "View History" on any employee to see their session breakdown and 30-day performance.

## 🔒 Security & Privacy
- **Idle Detection**: Monitors system-wide activity (mouse/keyboard) to ensure accuracy even outside the browser.
- **Token Based**: Employees only need a token to start tracking; no complex login required.
- **Configurable**: Backend URLs and idle thresholds can be adjusted in `extension/background.js`.

---
Created by [Mahadi](https://github.com/mahadi-cse)
