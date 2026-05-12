let timerInterval;
let currentSeconds = 0;
let isTimerRunning = false;

function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
}

async function updateUI() {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
        if (!response) return;

        const { status, totalWorkSeconds, employeeToken } = response;
        
        // Update Employee ID
        document.getElementById('employeeId').textContent = employeeToken || 'No Token';
        
        // Update Status Badge
        const badge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        
        badge.className = `status-badge ${status}`;
        statusText.textContent = status === 'active' ? 'Working' : (status === 'idle' ? 'Idle' : 'Locked');

        // Update Timer
        currentSeconds = totalWorkSeconds;
        document.getElementById('timer').textContent = formatTime(currentSeconds);

        // Start/Stop local ticking for visual smoothness
        if (status === 'active') {
            if (!isTimerRunning) {
                startLocalTicking();
            }
        } else {
            stopLocalTicking();
        }
    });
}

function startLocalTicking() {
    isTimerRunning = true;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        currentSeconds++;
        document.getElementById('timer').textContent = formatTime(currentSeconds);
    }, 1000);
}

function stopLocalTicking() {
    isTimerRunning = false;
    clearInterval(timerInterval);
}

// Initial update
updateUI();

// Poll for status changes while popup is open
setInterval(updateUI, 5000);
