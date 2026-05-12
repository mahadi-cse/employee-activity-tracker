# Work Tracker — Project Plan & Progress ✅

A real-time system to monitor employee activity and work duration via a browser extension and admin dashboard.

## Part 1: Browser Extension ✅
- ✅ **Core Files**
    - ✅ `manifest.json`: Permissions (idle, storage, alarms) and entry points.
    - ✅ `background.js`: Core logic for idle detection and state management.
    - ✅ `popup.html` / `popup.js`: Employee status view and timer.
    - ✅ `setup.html` / `setup.js`: Initial token entry screen.
- ✅ **Features**
    - ✅ System-wide idle detection (60s threshold).
    - ✅ Local work timer (HH:MM:SS) that pauses on idle/lock.
    - ✅ Every 60 seconds sync/heartbeat to backend.
    - ✅ Midnight local timer reset.
    - ✅ Persistent token storage.

## Part 2: Backend & Dashboard ✅
- ✅ **Architecture & Database**
    - ✅ Separate `client/` (Next.js) and `server/` (Node/Express) structure.
    - ✅ Prisma ORM integration with PostgreSQL schema.
    - ✅ `Employee` table (status, work seconds, last seen).
    - ✅ `ActivityLog` table (historical tracking).
- ✅ **API Routes (Server)**
    - ✅ `POST /api/activity`: Update status and log sync data.
    - ✅ `GET /api/employees`: Fetch status list for dashboard.
    - ✅ `GET /api/employees/:id/logs`: Fetch historical activity for reports.
    - ✅ `POST /api/employees`: Create new employee and generate token.
- ✅ **Dashboard Pages (Client)**
    - ✅ `/`: Premium admin login page (simulated).
    - ✅ `/dashboard`: Real-time status table with 30s auto-polling.
    - ✅ `/dashboard/employees/:id`: Individual activity timeline and logs.
    - ✅ `/dashboard/employees/new`: Employee onboarding and token generation.
- ✅ **Background Logic**
    - ✅ Disconnection Logic: Cron job checks every 5 mins for inactive heartbeats.
    - ✅ Day Reset Logic: Cron job at midnight to reset work seconds for all.

## Project Management ✅
- ✅ Unified Git repository at root.
- ✅ Cleaned up nested tracking (double tracking resolved).
- ✅ Global `.gitignore` for dependencies and environment variables.

---
**Status**: 100% COMPLETE 🚀
**Next Steps**: Connect to a live PostgreSQL database and run Prisma migrations.
