document.getElementById('saveBtn').addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    if (!token) {
        errorMsg.classList.remove('hidden');
        return;
    }

    // Save to storage
    await chrome.storage.local.set({ employeeToken: token });

    // Notify background script
    chrome.runtime.sendMessage({ type: 'TOKEN_UPDATED', token });

    // Success state - brief delay then close or redirect
    const btn = document.getElementById('saveBtn');
    btn.textContent = 'Activated!';
    btn.style.backgroundColor = 'var(--accent-working)';

    setTimeout(() => {
        window.close();
    }, 1500);
});

// Clear error on input
document.getElementById('token').addEventListener('input', () => {
    document.getElementById('errorMsg').classList.add('hidden');
});

// Load existing token if any
async function loadExistingToken() {
    const data = await chrome.storage.local.get('employeeToken');
    if (data.employeeToken) {
        document.getElementById('token').value = data.employeeToken;
    }
}

loadExistingToken();
