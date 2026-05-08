// --- EXPANDED MOCK DATABASE WITH FULL USER PROFILES ---
const USERS = [
    { 
        id: 1,
        username: "admin1", 
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        phone: "+1-555-0101",
        address: "123 Security St, Tech City",
        hash: "Admin@123", 
        role: "admin",
        avatar: "1",
        twoFAQuestion: "What was the name of your first pet?",
        twoFAAnswer: "Rex"
    },
    { 
        id: 2,
        username: "user1", 
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1-555-0102",
        address: "456 Developer Ave, Code Town",
        hash: "Userpass1", 
        role: "user",
        avatar: "2",
        twoFAQuestion: "What is your favorite book?",
        twoFAAnswer: "The Great Gatsby"
    }
];

// --- AVATAR CONFIGURATION ---
// Map from avatar id to emoji
const AVATARS = {
    '1': '👨‍💼',
    '2': '👩‍💼',
    '3': '👨‍💻',
    '4': '👩‍💻',
    '5': '👤'
};

const AVATAR_NAMES = {
    '1': 'Business Man',
    '2': 'Business Woman',
    '3': 'Developer',
    '4': 'Developer Woman',
    '5': 'Generic'
};

// --- APP STATE ---
let currentUser = null;
let currentLoginAttempt = null;

// --- OTP STATE ---
let currentOTP = null;
let otpExpiry = null;
let otpTimerInterval = null;
let resendTimerInterval = null;

// --- ACTIVITY LOGGING ---
function logActivity(user, action) {
    const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    const timestamp = new Date().toLocaleString();
    logs.push({ user, action, timestamp });
    localStorage.setItem('activityLogs', JSON.stringify(logs));
}

function getActivityLogs() {
    return JSON.parse(localStorage.getItem('activityLogs')) || [];
}

// --- USER PROFILE CRUD ---
function updateUserProfile(userId, updates) {
    const idx = USERS.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    Object.assign(USERS[idx], updates);
    logActivity(USERS[idx].username, 'Profile updated');
    return true;
}

function deleteUser(userId) {
    const idx = USERS.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    const username = USERS[idx].username;
    USERS.splice(idx, 1);
    logActivity('admin', `Deleted user: ${username}`);
    return true;
}

function addNewUser(userData) {
    const newId = Math.max(...USERS.map(u => u.id), 0) + 1;
    const newUser = {
        id: newId,
        ...userData,
        twoFAQuestion: userData.twoFAQuestion !== undefined ? userData.twoFAQuestion : '',
        twoFAAnswer: userData.twoFAAnswer !== undefined ? userData.twoFAAnswer : ''
    };
    USERS.push(newUser);
    logActivity("admin", `Created ${userData.role}: ${userData.username}`);
    return newUser;
}

// --- PASSWORD VALIDATION ---
function validatePassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLengthValid = password.length >= 8;
    return hasUppercase && hasLowercase && hasNumber && isLengthValid;
}

// --- EMAIL VALIDATION ---
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// --- SECURITY QUESTION HELPERS ---
function getUserSecurityQuestion(user) {
    return user?.twoFAQuestion || user?.secQ || '';
}

function getUserSecurityAnswer(user) {
    return user?.twoFAAnswer || user?.secA || '';
}

// --- NAVIGATION FUNCTIONS ---
function showLoginSection() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('mfa-section').classList.add('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function showSignupSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('signup-section').classList.remove('hidden');
    document.getElementById('mfa-section').classList.add('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function showMFA() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('mfa-section').classList.remove('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');

    const question = getUserSecurityQuestion(currentLoginAttempt);
    document.getElementById('security-prompt').innerText = question;
}

function showOTPSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('mfa-section').classList.add('hidden');
    document.getElementById('otp-section').classList.remove('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}


function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    errorEl.innerText = '';

    if (!username || !password) {
        errorEl.innerText = 'Username and password are required.';
        return;
    }

    const user = USERS.find(u => u.username === username && u.hash === password);
    if (!user) {
        errorEl.innerText = 'Invalid username or password.';
        logActivity(username, 'Failed login attempt');
        return;
    }

    currentLoginAttempt = user;
    const hasSecurityQuestion = getUserSecurityQuestion(user) && getUserSecurityAnswer(user);

    if (hasSecurityQuestion) {
        logActivity(username, 'Started MFA verification');
        showMFA();
    } else {
        completeLogin(user);
    }
}

async function verifyMFA() {
    const answer = document.getElementById('mfa-answer').value.trim();
    const correctAnswer = getUserSecurityAnswer(currentLoginAttempt);
    const mfaErrorEl = document.getElementById('mfa-error');

    if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
        mfaErrorEl.innerText = '';
        mfaErrorEl.style.display = 'none';
        logActivity(currentLoginAttempt.username, 'Security question answered correctly — OTP sent');
        await sendOTP(currentLoginAttempt);
    } else {
        mfaErrorEl.innerText = 'Incorrect answer. Try again.';
        mfaErrorEl.style.display = 'block';
        logActivity(currentLoginAttempt.username, 'Failed MFA — wrong security answer');
    }
}

// --- OTP FUNCTIONS ---

function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOTP(user) {
    // Generate and store OTP
    currentOTP = generateOTP();
    otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    const otpErr = document.getElementById('otp-error');
    otpErr.innerText = '';
    otpErr.style.display = 'none';

    try {
        await sendOTPEmail(user, currentOTP);

        showOTPSection();
        const email = user.email;
        document.getElementById('otp-email-notice').innerHTML =
            `A 6-digit OTP has been sent to <strong>${email}</strong>. Enter it below to complete login.`;
        document.getElementById('otp-input').value = '';

        startOTPTimer();
        setResendTimer(60);
        logActivity(user.username, 'OTP sent via Web3Forms email');
    } catch (error) {
        otpErr.innerText = 'Unable to send OTP email. Please try again in a moment.';
        otpErr.style.display = 'block';
        logActivity(user.username, 'OTP send failed via Web3Forms');
        currentOTP = null;
        otpExpiry = null;
        clearResendTimer();
    }
}

async function sendOTPEmail(user, otpCode) {
    const payload = {
        access_key: '0a13e294-80fd-4cb1-9e74-3ca1ef37034d',
        subject: 'Your IAS Website OTP Code',
        from_name: 'IAS Secure Auth',
        reply_to: 'no-reply@iaswebsite.com',
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        message: `Your one-time password is: ${otpCode}. It expires in 5 minutes. If you did not request this, please ignore this email.`
    };

    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Web3Forms request failed');
    }
    return data;
}

function startOTPTimer() {
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    function tick() {
        const remaining = otpExpiry - Date.now();
        const el = document.getElementById('otp-countdown');
        if (!el) { clearInterval(otpTimerInterval); return; }

        if (remaining <= 0) {
            clearInterval(otpTimerInterval);
            el.innerText = 'Expired';
            el.classList.add('otp-expired');
            currentOTP = null;
            return;
        }

        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        el.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
        el.classList.toggle('otp-expiring', remaining < 60000);
    }

    tick();
    otpTimerInterval = setInterval(tick, 1000);
}

function verifyOTP() {
    const entered = document.getElementById('otp-input').value.trim();
    const otpErr = document.getElementById('otp-error');

    if (!entered) {
        otpErr.innerText = 'Please enter the OTP code.';
        otpErr.style.display = 'block';
        return;
    }

    if (!currentOTP || Date.now() > otpExpiry) {
        otpErr.innerText = 'OTP has expired. Please request a new code.';
        otpErr.style.display = 'block';
        return;
    }

    if (entered === currentOTP) {
        clearInterval(otpTimerInterval);
        currentOTP = null;
        otpErr.innerText = '';
        otpErr.style.display = 'none';
        logActivity(currentLoginAttempt.username, 'OTP verified — Logged in successfully');
        completeLogin(currentLoginAttempt);
    } else {
        otpErr.innerText = 'Incorrect OTP. Please try again.';
        otpErr.style.display = 'block';
        logActivity(currentLoginAttempt.username, 'Failed OTP verification');
    }
}

async function resendOTP() {
    const resendBtn = document.getElementById('otp-resend-button');
    if (!currentLoginAttempt || (resendBtn && resendBtn.disabled)) return;

    clearInterval(otpTimerInterval);
    clearResendTimer();
    logActivity(currentLoginAttempt.username, 'OTP resend requested');
    await sendOTP(currentLoginAttempt);
}

function completeLogin(user) {
    currentUser = user;
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('mfa-answer').value = '';
    document.getElementById('mfa-error').innerText = '';
    document.getElementById('otp-input').value = '';

    // Clear OTP state
    currentOTP = null;
    otpExpiry = null;
    if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
    clearResendTimer();

    // Hide all auth sections
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('mfa-section').classList.add('hidden');
    document.getElementById('otp-section').classList.add('hidden');

    logActivity(user.username, 'Logged in successfully');

    if (user.role === 'admin') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadAdminDashboard();
    } else {
        document.getElementById('user-dashboard').classList.remove('hidden');
        loadUserDashboard();
    }
}

function logout() {
    logActivity(currentUser.username, 'Logged out');
    currentUser = null;
    currentLoginAttempt = null;
    currentOTP = null;
    otpExpiry = null;
    if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
    clearResendTimer();
    showLoginSection();
}

function setResendTimer(seconds) {
    const resendBtn = document.getElementById('otp-resend-button');
    const resendInfo = document.getElementById('otp-resend-info');
    if (!resendBtn || !resendInfo) return;

    let remaining = seconds;
    resendBtn.disabled = true;
    resendInfo.innerText = `You can resend the OTP in ${remaining} second${remaining === 1 ? '' : 's'}.`;

    if (resendTimerInterval) clearInterval(resendTimerInterval);
    resendTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearResendTimer();
            resendBtn.disabled = false;
            resendInfo.innerText = 'Did not receive the code? Click resend to try again.';
            return;
        }
        resendInfo.innerText = `You can resend the OTP in ${remaining} second${remaining === 1 ? '' : 's'}.`;
    }, 1000);
}

function clearResendTimer() {
    const resendBtn = document.getElementById('otp-resend-button');
    const resendInfo = document.getElementById('otp-resend-info');
    if (resendTimerInterval) {
        clearInterval(resendTimerInterval);
        resendTimerInterval = null;
    }
    if (resendBtn) resendBtn.disabled = false;
    if (resendInfo) resendInfo.innerText = 'You can resend the OTP if you did not receive it.';
}

// --- SIGNUP FUNCTION ---
function signUpUser() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName = document.getElementById('signup-lastname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const question = document.getElementById('signup-security-question').value;
    const answer = document.getElementById('signup-security-answer').value.trim();
    const errorEl = document.getElementById('signup-error');

    errorEl.innerText = '';

    if (!username || !password || !firstName || !lastName || !email) {
        errorEl.innerText = 'All fields are required.';
        return;
    }

    if (question && !answer) {
        errorEl.innerText = 'Please provide an answer for your chosen security question.';
        return;
    }

    if (!question && answer) {
        errorEl.innerText = 'Please choose a security question to use this answer.';
        return;
    }

    if (USERS.find(u => u.username === username)) {
        errorEl.innerText = 'Username already exists.';
        return;
    }

    if (USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        errorEl.innerText = 'Email already in use.';
        return;
    }

    if (!validatePassword(password)) {
        errorEl.innerText = 'Password must have uppercase, lowercase, number, and at least 8 characters.';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorEl.innerText = 'Enter a valid email address.';
        return;
    }

    addNewUser({
        username,
        firstName,
        lastName,
        email,
        phone: '',
        address: '',
        hash: password,
        role: 'user',
        avatar: String((USERS.length % 5) + 1),
        twoFAQuestion: question || '',
        twoFAAnswer: answer || ''
    });

    errorEl.classList.remove('error');
    errorEl.classList.add('success');
    errorEl.innerText = 'Account created successfully! You can now log in.';

    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-firstname').value = '';
    document.getElementById('signup-lastname').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-security-question').value = '';
    document.getElementById('signup-security-answer').value = '';

    setTimeout(() => {
        errorEl.classList.remove('success');
        errorEl.classList.add('error');
        showLoginSection();
    }, 2000);
}
