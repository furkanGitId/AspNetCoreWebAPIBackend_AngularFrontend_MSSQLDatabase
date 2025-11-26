// JWT Token Expiry Timer for Swagger UI
(function () {
    let timerInterval = null;
    let timerElement = null;
    let countdownElement = null;
    let hasShownExpiryAlert = false;
    let currentToken = null;

    // Function to decode JWT token
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT:', e);
            return null;
        }
    }

    // Function to format time remaining
    function formatTimeRemaining(seconds) {
        if (seconds <= 0) {
            return '<span style="color: #f93e3e; font-weight: bold; font-size: 16px;">⚠️ TOKEN EXPIRED</span>';
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        let timeString = '';
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
        timeString += `${secs}s`;

        // Color coding based on time remaining
        let color = '#49cc90'; // green
        let icon = '✓';
        if (seconds < 300) { // less than 5 minutes
            color = '#fca130';
            icon = '⚠️';
        }
        if (seconds < 60) { // less than 1 minute
            color = '#f93e3e';
            icon = '🔴';
        }

        return `<span style="color: ${color}; font-weight: bold; font-size: 16px;">${icon} ${timeString} remaining</span>`;
    }

    // Function to show expiration alert
    function showExpirationAlert() {
        if (hasShownExpiryAlert) return;
        hasShownExpiryAlert = true;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s;
        `;

        // Create alert box
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            background: #1f1f1f;
            border: 2px solid #f93e3e;
            border-radius: 8px;
            padding: 30px;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(249, 62, 62, 0.3);
            animation: slideIn 0.3s;
        `;

        alertBox.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <h2 style="color: #f93e3e; margin: 0 0 15px 0; font-size: 24px;">Token Expired!</h2>
                <p style="color: #b3b3b3; margin: 0 0 20px 0; font-size: 16px;">
                    Your JWT authentication token has expired. Please obtain a new token and re-authorize.
                </p>
                <button id="closeAlertBtn" style="
                    background: #f93e3e;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                ">Close</button>
            </div>
        `;

        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #closeAlertBtn:hover {
                background: #d63333 !important;
            }
        `;
        document.head.appendChild(style);

        // Close button handler
        document.getElementById('closeAlertBtn').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s';
            setTimeout(() => overlay.remove(), 300);
        });

        // Play alert sound (optional - browser dependent)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio notification not available');
        }
    }

    // Function to create and update timer
    function updateTimer(expiryTime) {
        const now = Math.floor(Date.now() / 1000);
        const secondsRemaining = expiryTime - now;

        if (countdownElement) {
            countdownElement.innerHTML = formatTimeRemaining(secondsRemaining);

            // Add pulsing animation when time is running out
            if (secondsRemaining > 0 && secondsRemaining < 60) {
                countdownElement.style.animation = 'pulse 1s infinite';
            } else {
                countdownElement.style.animation = 'none';
            }
        }

        // Show alert when token expires
        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            showExpirationAlert();
        }
    }

    // Function to remove all existing timer boxes
    function removeAllTimerBoxes() {
        const existingTimers = document.querySelectorAll('#jwt-timer');
        existingTimers.forEach(timer => timer.remove());
    }

    // Function to start timer
    function startTimer(token) {
        // Check if token is the same as current
        if (token === currentToken && timerElement && document.body.contains(timerElement)) {
            console.log('Timer already running for this token');
            return;
        }

        currentToken = token;
        console.log('Starting timer for new token...');

        // Clear existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        // Remove ALL existing timer elements
        removeAllTimerBoxes();
        timerElement = null;
        countdownElement = null;

        // Reset alert flag
        hasShownExpiryAlert = false;

        // Parse token
        const decoded = parseJwt(token);
        if (!decoded || !decoded.exp) {
            console.warn('Could not decode JWT token or expiry not found');
            return;
        }

        console.log('Token decoded successfully. Expiry:', new Date(decoded.exp * 1000));

        // Create a single timer box at the top of the page
        setTimeout(() => {
            // Remove any timer boxes that might have been created
            removeAllTimerBoxes();

            // Create timer element
            timerElement = document.createElement('div');
            timerElement.id = 'jwt-timer';
            timerElement.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 1000;
                margin: 15px 0;
                padding: 15px;
                background: linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%);
                border-radius: 6px;
                border-left: 4px solid #49cc90;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                min-width: 320px;
                max-width: 400px;
            `;

            // Show token info
            const expiresAt = new Date(decoded.exp * 1000).toLocaleString();

            timerElement.innerHTML = `
                <div style="color: #b3b3b3; margin-bottom: 10px; font-size: 13px;">
                    <strong style="color: #fff;">📋 Token Information:</strong><br>
                    <div style="margin-top: 5px; padding-left: 10px;">
                        ⏰ Expires: <span style="color: #fca130;">${expiresAt}</span>
                    </div>
                </div>
                <div id="timer-countdown" style="
                    padding: 10px;
                    background: #161616;
                    border-radius: 4px;
                    text-align: center;
                "></div>
            `;

            // Add pulsing animation style
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
            `;
            if (!document.querySelector('#pulse-animation-style')) {
                style.id = 'pulse-animation-style';
                document.head.appendChild(style);
            }

            // Add to body instead of container
            document.body.appendChild(timerElement);

            // Update countdown element reference
            countdownElement = document.getElementById('timer-countdown');

            // Initial update
            updateTimer(decoded.exp);

            // Start countdown interval
            timerInterval = setInterval(() => {
                updateTimer(decoded.exp);
            }, 1000);

            console.log('Timer started successfully');
        }, 100);
    }

    // Function to extract token from input
    function extractAndStartTimer() {
        // Try multiple selectors to find the token input
        const tokenInput = document.querySelector('input[placeholder*="Value"]') ||
            document.querySelector('input[aria-label*="auth"]') ||
            document.querySelector('textarea[placeholder*="Value"]') ||
            document.querySelector('.auth-wrapper input') ||
            document.querySelector('.body-param input');

        if (tokenInput && tokenInput.value) {
            let token = tokenInput.value.trim();

            // Remove 'Bearer ' prefix if present
            if (token.toLowerCase().startsWith('bearer ')) {
                token = token.substring(7).trim();
            }

            // Validate JWT format (3 parts separated by dots)
            if (token && token.split('.').length === 3 && token !== currentToken) {
                console.log('Valid JWT format detected, starting timer');
                startTimer(token);
            }
        }
    }

    // Function to monitor authorization changes
    function monitorAuthorization() {
        console.log('Monitoring authorization...');

        // Watch for Authorize button clicks
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Check if clicking Authorize or Close button
            if (target.classList.contains('authorize') ||
                target.closest('.authorize') ||
                target.classList.contains('btn-done') ||
                target.textContent === 'Close') {
                setTimeout(extractAndStartTimer, 800);
            }
        });

        // Watch for input changes
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                let token = e.target.value.trim();

                if (token.toLowerCase().startsWith('bearer ')) {
                    token = token.substring(7).trim();
                }

                // Only start timer if token looks like a JWT and is different
                if (token && token.split('.').length === 3) {
                    setTimeout(() => startTimer(token), 500);
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing JWT timer');
            setTimeout(monitorAuthorization, 1000);
        });
    } else {
        console.log('DOM already loaded, initializing JWT timer');
        setTimeout(monitorAuthorization, 1000);
    }

    // Utility: Detect JWT token format
    function isJwt(token) {
        return typeof token === 'string' && token.split('.').length === 3;
    }

    // Utility: Add copy button next to token
    function addCopyButtonToToken(tokenNode, token) {
        if (tokenNode.nextSibling && tokenNode.nextSibling.classList && tokenNode.nextSibling.classList.contains('swagger-copy-btn')) {
            return; // Button already added
        }

        const btn = document.createElement('button');
        btn.textContent = '📋';
        btn.title = 'Copy token';
        btn.className = 'swagger-copy-btn';
        btn.style.cssText = `
            margin-left: 8px;
            font-size: 16px;
            background: none;
            border: none;
            color: #49cc90;
            cursor: pointer;
            vertical-align: middle;
        `;

        btn.onclick = function () {
            navigator.clipboard.writeText(token)
                .then(() => {
                    btn.textContent = '✅';
                    setTimeout(() => btn.textContent = '📋', 1000);
                });
        };

        tokenNode.parentNode.insertBefore(btn, tokenNode.nextSibling);
    }

    // Observe Swagger response bodies for JWT tokens
    function observeSwaggerResponses() {
        const observer = new MutationObserver(() => {
            // Find all response bodies
            document.querySelectorAll('.responses-table .response-col_description pre, .responses-table .response-col_description .microlight, .response .highlight-code').forEach(pre => {
                // Try to extract token from JSON response
                let json;
                try {
                    json = JSON.parse(pre.textContent);
                } catch {
                    json = null;
                }
                if (json && typeof json === 'object') {
                    // Look for token property (commonly named 'token', 'access_token', etc.)
                    for (const key of Object.keys(json)) {
                        if (isJwt(json[key])) {
                            // Find the text node containing the token
                            const tokenValue = json[key];
                            // Find the node in the DOM
                            const regex = new RegExp(tokenValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                            const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT, {
                                acceptNode: node => regex.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                            });
                            const tokenNode = walker.nextNode();
                            if (tokenNode) {
                                addCopyButtonToToken(tokenNode, tokenValue);
                            }
                        }
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Start observing after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeSwaggerResponses);
    } else {
        observeSwaggerResponses();
    }
})();