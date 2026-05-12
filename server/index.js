require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Extension API ---

// POST /api/activity - Received from extension every 60s
app.post('/api/activity', async (req, res) => {
    const { employeeId, status, totalWorkSeconds, timestamp } = req.body;
    
    // In the blueprint, it mentioned "Authorization: Bearer <token>"
    // But the payload also has employeeId (which is the token in the extension logic I wrote)
    const token = req.headers.authorization?.split(' ')[1] || employeeId;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { token: token }
        });

        if (!employee) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Update employee status
        await prisma.employee.update({
            where: { id: employee.id },
            data: {
                status: status,
                totalWorkSecs: totalWorkSeconds,
                lastSeenAt: new Date(timestamp)
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                employeeId: employee.id,
                status: status,
                totalWorkSecs: totalWorkSeconds,
                loggedAt: new Date(timestamp)
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Activity Sync Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Dashboard API (Admin) ---

// GET /api/employees - Fetch all employees for dashboard
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// GET /api/employees/:id/logs - Fetch history for an employee
app.get('/api/employees/:id/logs', async (req, res) => {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    
    try {
        let dateFilter = {};
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            dateFilter = {
                loggedAt: {
                    gte: start,
                    lt: end
                }
            };
        }

        const logs = await prisma.activityLog.findMany({
            where: { 
                employeeId: id,
                ...dateFilter
            },
            orderBy: { loggedAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// POST /api/employees - Create new employee
// Get 30-day history for an employee
app.get('/api/employees/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const logs = await prisma.activityLog.findMany({
            where: { employeeId: id },
            orderBy: { loggedAt: 'desc' }
        });

        // Group by date and calculate totals
        const historyMap = {};
        logs.forEach(log => {
            const date = new Date(log.loggedAt).toISOString().split('T')[0];
            if (!historyMap[date]) {
                historyMap[date] = { active: 0, idle: 0 };
            }
            
            // For active time, we take the max totalWorkSecs recorded that day
            if (log.totalWorkSecs > historyMap[date].active) {
                historyMap[date].active = log.totalWorkSecs;
            }

            // For idle time, each idle log represents ~30 seconds of inactivity
            if (log.status === 'idle') {
                historyMap[date].idle += 30;
            }
        });

        const history = Object.keys(historyMap).map(date => ({
            date,
            totalWorkSecs: historyMap[date].active,
            totalIdleSecs: historyMap[date].idle
        })).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/employees', async (req, res) => {
    const { name, role } = req.body;
    if (!name || !role) {
        return res.status(400).json({ error: 'Name and role are required' });
    }

    try {
        const employee = await prisma.employee.create({
            data: { name, role }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// --- Background Jobs ---

// 1. Disconnection Logic (Every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
    console.log('Running disconnection check...');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    try {
        await prisma.employee.updateMany({
            where: {
                lastSeenAt: { lt: fiveMinutesAgo },
                status: { not: 'locked' }
            },
            data: { status: 'disconnected' }
        });
    } catch (error) {
        console.error('Disconnection Check Error:', error);
    }
});

// 2. Midnight Reset Logic (00:00 every day)
cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight reset...');
    try {
        await prisma.employee.updateMany({
            data: { totalWorkSecs: 0 }
        });
    } catch (error) {
        console.error('Midnight Reset Error:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
