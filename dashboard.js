// --- USER DASHBOARD FUNCTIONALITY ---

function loadUserDashboard() {
    if (!currentUser) return;
    document.getElementById('user-name-display').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
    showDashboardView();
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getUserLogs(username) {
    return getActivityLogs().filter(l => l.user === username);
}

function getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Mac/.test(ua)) os = 'Mac';
    else if (/Linux/.test(ua)) os = 'Linux';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad/.test(ua)) os = 'iOS';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = 'Chrome';
    else if (/Firefox/.test(ua)) browser = 'Firefox';
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
    else if (/Edg/.test(ua)) browser = 'Edge';
    return `${os}/${browser}`;
}

// ── MAIN DASHBOARD VIEW ───────────────────────────────────────────────────────

function showDashboardView() {
    const view = document.getElementById('dashboard-view');
    const avatarEmoji = AVATARS[currentUser.avatar] || '👤';
    const userLogs = getUserLogs(currentUser.username);
    const recentLogs = [...userLogs].reverse().slice(0, 5);
    const device = getDeviceInfo();
    const twoFAEnabled = currentUser.twoFAEnabled !== false; // default true

    view.innerHTML = `
        <div class="dashboard-header">
            <h2>Welcome, ${currentUser.firstName}</h2>
            <p class="subtitle">Clearance Level: ${currentUser.role.toUpperCase()}</p>
        </div>

        <!-- STATUS CARDS -->
        <div class="status-cards">
            <div class="status-card">
                <span class="status-card-label">SECURITY STATUS</span>
                <span class="status-card-value green">✓ Active</span>
            </div>
            <div class="status-card">
                <span class="status-card-label">CURRENT DEVICE</span>
                <span class="status-card-value">${device}</span>
            </div>
            <div class="status-card">
                <span class="status-card-label">OTHER SESSIONS</span>
                <span class="status-card-value">0</span>
            </div>
        </div>

        <div class="dashboard-two-col">
            <!-- MY PROFILE -->
            <div class="dash-card">
                <h3 class="dash-card-title">My Profile</h3>
                <div class="profile-table">
                    <div class="profile-table-row">
                        <span class="pt-label">Avatar</span>
                        <span class="pt-value avatar-sm">${avatarEmoji}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">First Name</span>
                        <span class="pt-value">${currentUser.firstName}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Last Name</span>
                        <span class="pt-value">${currentUser.lastName}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Contact</span>
                        <span class="pt-value">${currentUser.phone || '—'}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Address</span>
                        <span class="pt-value">${currentUser.address || '—'}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Username</span>
                        <span class="pt-value">${currentUser.username}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Email</span>
                        <span class="pt-value">${currentUser.email}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Role</span>
                        <span class="pt-value"><span class="badge badge-user">${currentUser.role.toUpperCase()}</span></span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">2FA Status</span>
                        <span class="pt-value ${twoFAEnabled ? 'green' : 'muted'}">${twoFAEnabled ? '✓ Enabled' : '✗ Disabled'}</span>
                    </div>
                    <div class="profile-table-row">
                        <span class="pt-label">Security Question</span>
                        <span class="pt-value ${currentUser.twoFAQuestion ? '' : 'muted italic'}">
                            ${currentUser.twoFAQuestion || '⚠ Not set — add one below for extra protection'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- ACTIVE SESSIONS -->
            <div class="dash-card">
                <h3 class="dash-card-title">Active Sessions</h3>
                <div class="session-item">
                    <span class="session-badge">Current Device</span>
                    <strong>${device}</strong>
                </div>
                <p class="muted small" style="margin:10px 0 20px;">No other sessions detected.</p>
                <button class="btn btn-secondary btn-full" onclick="signOutOtherSessions()">Sign out of all other sessions</button>

                <!-- PERSONAL AUDIT LOG -->
                <h3 class="dash-card-title" style="margin-top:30px;">Personal Audit Log</h3>
                <p class="muted small" style="margin-bottom:12px;">Last 5 login events for your account.</p>
                <table class="audit-table">
                    <thead>
                        <tr><th>Timestamp</th><th>Event</th></tr>
                    </thead>
                    <tbody>
                        ${recentLogs.length > 0 ? recentLogs.map(log => {
                            const txt = log.action || '';
                            let cls = 'status-info';
                            if (txt.toLowerCase().includes('logged in')) cls = 'status-success';
                            if (txt.toLowerCase().includes('failed')) cls = 'status-error';
                            return `<tr>
                                <td class="small muted">${log.timestamp || ''}</td>
                                <td><span class="status-badge ${cls}">${txt}</span></td>
                            </tr>`;
                        }).join('') : `<tr><td colspan="2" class="muted small" style="text-align:center;padding:20px;">No login events yet.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function signOutOtherSessions() {
    logActivity(currentUser.username, 'Signed out of all other sessions');
    showNotification('All other sessions have been signed out.', 'success');
    setTimeout(() => showDashboardView(), 1200);
}

// ── EDIT PROFILE VIEW ─────────────────────────────────────────────────────────

function showEditProfileView() {
    const view = document.getElementById('dashboard-view');

    const avatarOptions = Object.entries(AVATARS).map(([id, emoji]) => `
        <div class="avatar-option ${currentUser.avatar === id ? 'selected' : ''}"
             onclick="selectAvatar('${id}')">${emoji}</div>
    `).join('');

    view.innerHTML = `
        <div class="dashboard-header">
            <h2>Edit Your Profile</h2>
            <p class="subtitle">Update your personal information</p>
        </div>

        <div class="edit-form-container">

            <!-- Avatar -->
            <div class="form-section">
                <h3>Select Avatar</h3>
                <div class="avatar-selector">${avatarOptions}</div>
                <p class="form-help">Click an emoji to set your avatar</p>
            </div>

            <!-- Personal Info -->
            <div class="form-section">
                <h3>Personal Information</h3>
                <div class="form-group">
                    <label for="edit-firstname">First Name:</label>
                    <input type="text" id="edit-firstname" value="${currentUser.firstName}">
                </div>
                <div class="form-group">
                    <label for="edit-lastname">Last Name:</label>
                    <input type="text" id="edit-lastname" value="${currentUser.lastName}">
                </div>
                <div class="form-group">
                    <label for="edit-email">Email:</label>
                    <input type="email" id="edit-email" value="${currentUser.email}">
                </div>
                <div class="form-group">
                    <label for="edit-phone">Phone:</label>
                    <input type="tel" id="edit-phone" value="${currentUser.phone || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-address">Address:</label>
                    <input type="text" id="edit-address" value="${currentUser.address || ''}">
                </div>
                <div class="form-actions" style="justify-content:flex-start;">
                    <button class="btn btn-primary" onclick="savePersonalInfo()">Save Personal Info</button>
                </div>
            </div>

            <!-- Change Password -->
            <div class="form-section">
                <h3>Change Password</h3>
                <div class="form-group">
                    <label for="current-password">Current Password:</label>
                    <input type="password" id="current-password" placeholder="Enter current password">
                </div>
                <div class="form-group">
                    <label for="new-password">New Password:</label>
                    <input type="password" id="new-password" placeholder="Must be 8+ chars with uppercase, lowercase, number"
                           oninput="updatePasswordStrength(this.value)">
                    <div class="pw-strength-bar-wrap">
                        <div id="pw-strength-bar" class="pw-strength-bar"></div>
                    </div>
                    <small id="pw-strength-label" class="form-help">Password strength: —</small>
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirm New Password:</label>
                    <input type="password" id="confirm-password" placeholder="Confirm new password">
                </div>
                <p class="form-help">Leave all fields blank to keep current password.</p>
                <div class="form-actions" style="justify-content:flex-start;">
                    <button class="btn btn-primary" onclick="savePasswordChange()">Update Password</button>
                </div>
            </div>

            <!-- Security Question -->
            <div class="form-section">
                <h3>Security Question <span class="section-note">(optional — adds extra login protection)</span></h3>
                <div class="form-group">
                    <label for="edit-2fa-question">Choose a Question</label>
                    <select id="edit-2fa-question">
                        <option value="" ${!currentUser.twoFAQuestion ? 'selected' : ''}>-- Select a question --</option>
                        <option value="What was the name of your first pet?" ${currentUser.twoFAQuestion === 'What was the name of your first pet?' ? 'selected' : ''}>What was the name of your first pet?</option>
                        <option value="What is your mother's maiden name?" ${currentUser.twoFAQuestion === "What is your mother's maiden name?" ? 'selected' : ''}>What is your mother's maiden name?</option>
                        <option value="What was the name of your first school?" ${currentUser.twoFAQuestion === 'What was the name of your first school?' ? 'selected' : ''}>What was the name of your first school?</option>
                        <option value="What city were you born in?" ${currentUser.twoFAQuestion === 'What city were you born in?' ? 'selected' : ''}>What city were you born in?</option>
                        <option value="What is your favorite book?" ${currentUser.twoFAQuestion === 'What is your favorite book?' ? 'selected' : ''}>What is your favorite book?</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-2fa-answer">Your Answer</label>
                    <input type="text" id="edit-2fa-answer" value="${currentUser.twoFAAnswer || ''}" placeholder="Enter your answer">
                </div>
                <div class="form-actions" style="justify-content:flex-start;">
                    <button class="btn btn-primary" onclick="saveSecurityQuestion()">Save Security Question</button>
                </div>
            </div>

            <!-- 2FA Preferences -->
            <div class="form-section">
                <h3>2FA Preferences</h3>
                <div class="twofa-pref-row">
                    <div>
                        <strong>Email OTP on login</strong>
                        <p class="muted small">Require a verification code each time you log in.</p>
                    </div>
                    <div class="toggle-wrap" onclick="toggle2FA()">
                        <div id="twofa-toggle" class="toggle-track ${currentUser.twoFAEnabled !== false ? 'on' : ''}">
                            <div class="toggle-thumb"></div>
                        </div>
                        <span id="twofa-label" class="toggle-label">${currentUser.twoFAEnabled !== false ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="showDashboardView()">← Back to Dashboard</button>
            </div>

            <div id="notification" class="notification hidden"></div>
        </div>
    `;
}

// ── SAVE HANDLERS (split per section) ────────────────────────────────────────

function savePersonalInfo() {
    const firstName = document.getElementById('edit-firstname').value.trim();
    const lastName  = document.getElementById('edit-lastname').value.trim();
    const email     = document.getElementById('edit-email').value.trim();
    const phone     = document.getElementById('edit-phone').value.trim();
    const address   = document.getElementById('edit-address').value.trim();

    if (!firstName || !lastName || !email) {
        showNotification('First name, last name and email are required.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Invalid email format.', 'error'); return;
    }

    const updates = { firstName, lastName, email, phone, address, avatar: selectedAvatarId || currentUser.avatar };
    if (updateUserProfile(currentUser.id, updates)) {
        Object.assign(currentUser, updates);
        document.getElementById('user-name-display').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
        showNotification('Personal info saved successfully!', 'success');
    } else {
        showNotification('Failed to save.', 'error');
    }
}

function savePasswordChange() {
    const currentPass = document.getElementById('current-password').value;
    const newPass     = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    if (!currentPass && !newPass && !confirmPass) {
        showNotification('Enter your current and new password to update.', 'error'); return;
    }
    if (!currentPass || !newPass || !confirmPass) {
        showNotification('All three password fields are required.', 'error'); return;
    }
    if (currentPass !== currentUser.hash) {
        showNotification('Current password is incorrect.', 'error'); return;
    }
    if (!validatePassword(newPass)) {
        showNotification('New password must have uppercase, lowercase, number, 8+ chars.', 'error'); return;
    }
    if (newPass !== confirmPass) {
        showNotification('Passwords do not match.', 'error'); return;
    }

    currentUser.hash = newPass;
    updateUserProfile(currentUser.id, { hash: newPass });
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('pw-strength-bar').style.width = '0';
    document.getElementById('pw-strength-label').innerText = 'Password strength: —';
    showNotification('Password updated successfully!', 'success');
}

function saveSecurityQuestion() {
    const question = document.getElementById('edit-2fa-question').value;
    const answer   = document.getElementById('edit-2fa-answer').value.trim();

    if ((question && !answer) || (!question && answer)) {
        showNotification('Provide both a question and answer, or leave both blank.', 'error'); return;
    }

    const updates = { twoFAQuestion: question || '', twoFAAnswer: answer || '' };
    if (updateUserProfile(currentUser.id, updates)) {
        Object.assign(currentUser, updates);
        showNotification('Security question saved!', 'success');
    } else {
        showNotification('Failed to save.', 'error');
    }
}

function toggle2FA() {
    currentUser.twoFAEnabled = currentUser.twoFAEnabled === false ? true : false;
    updateUserProfile(currentUser.id, { twoFAEnabled: currentUser.twoFAEnabled });
    const on = currentUser.twoFAEnabled !== false;
    const track = document.getElementById('twofa-toggle');
    const label = document.getElementById('twofa-label');
    track.classList.toggle('on', on);
    label.innerText = on ? 'Enabled' : 'Disabled';
    logActivity(currentUser.username, `2FA ${on ? 'enabled' : 'disabled'}`);
}

// ── PASSWORD STRENGTH ─────────────────────────────────────────────────────────

function updatePasswordStrength(val) {
    const bar   = document.getElementById('pw-strength-bar');
    const label = document.getElementById('pw-strength-label');
    if (!bar || !label) return;

    let score = 0;
    if (val.length >= 8)            score++;
    if (/[A-Z]/.test(val))          score++;
    if (/[a-z]/.test(val))          score++;
    if (/[0-9]/.test(val))          score++;
    if (/[^A-Za-z0-9]/.test(val))   score++;

    const levels = [
        { pct: '0%',   cls: '',         text: '—' },
        { pct: '20%',  cls: 'str-weak', text: 'weak' },
        { pct: '40%',  cls: 'str-weak', text: 'weak' },
        { pct: '60%',  cls: 'str-fair', text: 'fair' },
        { pct: '80%',  cls: 'str-good', text: 'good' },
        { pct: '100%', cls: 'str-strong','text': 'strong' }
    ];
    const lvl = levels[val.length === 0 ? 0 : score];
    bar.style.width = lvl.pct;
    bar.className = `pw-strength-bar ${lvl.cls}`;
    label.innerText = `Password strength: ${lvl.text}`;
}

// ── AVATAR / NAVIGATION ───────────────────────────────────────────────────────

let selectedAvatarId = null;

function selectAvatar(avatarId) {
    selectedAvatarId = avatarId;
    document.querySelectorAll('.avatar-option').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('onclick') === `selectAvatar('${avatarId}')`);
    });
}

function showNotification(message, type) {
    const n = document.getElementById('notification');
    if (n) {
        n.innerText = message;
        n.className = `notification ${type}`;
        n.classList.remove('hidden');
        setTimeout(() => n.classList.add('hidden'), 3000);
    }
}

function navigateDashboard(section) {
    document.querySelectorAll('#user-dashboard .nav-item').forEach(i => i.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    if (section === 'dashboard') {
        showDashboardView();
    } else if (section === 'edit') {
        selectedAvatarId = currentUser.avatar;
        showEditProfileView();
    }
}
