// Configuration
const IDLE_THRESHOLD = 15; // seconds (minimum allowed by Chrome)
const SYNC_INTERVAL = 0.5; // minutes (30 seconds)
const BACKEND_URL = 'http://localhost:3001/api/activity';

// Internal State
let workSeconds = 0;
let lastState = 'active';
let sessionStartTime = Date.now();
let employeeToken = null;

// Initialize
chrome.idle.setDetectionInterval(IDLE_THRESHOLD);

// Top-level initialization for MV3 Service Worker
async function initializeState() {
    const data = await chrome.storage.local.get(['workSeconds', 'lastResetDay', 'employeeToken']);
    workSeconds = data.workSeconds || 0;
    employeeToken = data.employeeToken || null;
    checkDateReset(data.lastResetDay);
    console.log('State initialized:', { workSeconds, employeeToken });
}

initializeState();

chrome.runtime.onInstalled.addListener(async () => {

    // Setup sync alarm
    chrome.alarms.create('sync_alarm', { periodInMinutes: SYNC_INTERVAL });

    // Initialize storage
    const data = await chrome.storage.local.get(['workSeconds', 'lastResetDay', 'employeeToken']);
    workSeconds = data.workSeconds || 0;
    employeeToken = data.employeeToken || null;

    checkDateReset(data.lastResetDay);

    if (!employeeToken) {
        chrome.tabs.create({ url: 'setup.html' });
    }
});

// Handle Startup
chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get(['workSeconds', 'lastResetDay', 'employeeToken']);
    workSeconds = data.workSeconds || 0;
    employeeToken = data.employeeToken || null;
    sessionStartTime = Date.now();

    checkDateReset(data.lastResetDay);
});

// Idle Detection Logic
chrome.idle.onStateChanged.addListener((newState) => {
    console.log(`State changed to: ${newState}`);
    const now = Date.now();

    if (lastState === 'active') {
        // Just transitioned FROM active to something else (idle or locked)
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        workSeconds += elapsed;
        chrome.storage.local.set({ workSeconds });
    }

    if (newState === 'active') {
        // Just transitioned TO active
        sessionStartTime = now;
    }

    lastState = newState;
});

// Alarm for Sync & Heartbeat
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'sync_alarm') {
        await syncWithBackend();
    }
});

async function syncWithBackend() {
    const data = await chrome.storage.local.get(['employeeToken', 'lastResetDay', 'workSeconds']);
    if (!data.employeeToken) return;

    checkDateReset(data.lastResetDay);

    // Ensure we use the latest stored workSeconds
    workSeconds = data.workSeconds || 0;

    // Calculate current live seconds if active
    let currentTotal = workSeconds;
    if (lastState === 'active') {
        const liveElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        currentTotal += liveElapsed;
    }

    const payload = {
        employeeId: data.employeeToken,
        status: lastState,
        totalWorkSeconds: currentTotal,
        timestamp: new Date().toISOString()
    };

    console.log('Syncing payload:', payload);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network response was not ok');
        console.log('Sync successful');
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

function checkDateReset(lastResetDay) {
    const today = new Date().toDateString();
    if (lastResetDay !== today) {
        workSeconds = 0;
        chrome.storage.local.set({
            workSeconds: 0,
            lastResetDay: today
        });
        sessionStartTime = Date.now();
    }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'GET_STATUS') {
        const data = await chrome.storage.local.get(['workSeconds', 'employeeToken']);
        workSeconds = data.workSeconds || 0;
        employeeToken = data.employeeToken || null;

        let currentTotal = workSeconds;
        if (lastState === 'active') {
            currentTotal += Math.floor((Date.now() - sessionStartTime) / 1000);
        }
        sendResponse({
            status: lastState,
            totalWorkSeconds: currentTotal,
            employeeToken: employeeToken
        });
    }

    if (request.type === 'TOKEN_UPDATED') {
        employeeToken = request.token;
        syncWithBackend(); // Initial sync
    }
    return true;
});
