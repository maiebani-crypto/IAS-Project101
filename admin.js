// --- ADMIN DASHBOARD FUNCTIONALITY ---

function loadAdminDashboard() {
    document.getElementById('admin-name-display').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
    showAdminMainView();
}

function showAdminMainView() {
    const view = document.getElementById('admin-content');

    view.innerHTML = `
        <div class="admin-header">
            <h2>Admin Dashboard</h2>
            <p class="subtitle">System Management & Monitoring</p>
        </div>

        <div class="admin-tabs">
            <button class="tab-btn active" onclick="switchAdminTab('overview', this)">Overview</button>
            <button class="tab-btn" onclick="switchAdminTab('users', this)">Users</button>
            <button class="tab-btn" onclick="switchAdminTab('logs', this)">Activity Logs</button>
            <button class="tab-btn" onclick="switchAdminTab('trends', this)">Auth Trends</button>
            <button class="tab-btn" onclick="switchAdminTab('profile', this)">Profile</button>
        </div>

        <div id="admin-tab-content"></div>
    `;

    switchAdminTab('overview', view.querySelector('.tab-btn'));
}

function switchAdminTab(tab, btnEl) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const content = document.getElementById('admin-tab-content');

    if (tab === 'overview') {
        showAdminOverview(content);
    } else if (tab === 'users') {
        showUsersManagement(content);
    } else if (tab === 'logs') {
        showActivityLogs(content);
    } else if (tab === 'trends') {
        showAuthTrends(content);
    } else if (tab === 'profile') {
        showAdminProfile(content);
    }
}

function showAdminOverview(container) {
    const admins = USERS.filter(u => u.role === 'admin');
    const standardUsers = USERS.filter(u => u.role === 'user');
    const logs = getActivityLogs();

    container.innerHTML = `
        <div class="overview-stats">
            <div class="stat-card">
                <h4>Total Users</h4>
                <div class="stat-number">${USERS.length}</div>
                <p class="stat-label">Administrators: ${admins.length} | Users: ${standardUsers.length}</p>
            </div>
            <div class="stat-card">
                <h4>Activity Logs</h4>
                <div class="stat-number">${logs.length}</div>
                <p class="stat-label">System events tracked</p>
            </div>
            <div class="stat-card">
                <h4>System Status</h4>
                <div class="stat-number">🟢 Active</div>
                <p class="stat-label">All systems operational</p>
            </div>
        </div>
    `;
}

function showUsersManagement(container) {
    const admins = USERS.filter(u => u.role === 'admin');
    const standardUsers = USERS.filter(u => u.role === 'user');

    container.innerHTML = `
        <div class="users-management">
            <div class="create-user-section">
                <h3>Create New Account</h3>
                <div class="create-user-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-username">Username:</label>
                            <input type="text" id="new-username" placeholder="Enter username">
                        </div>
                        <div class="form-group">
                            <label for="new-user-password">Password:</label>
                            <input type="password" id="new-user-password" placeholder="8+ chars, uppercase, lowercase, number">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-firstname">First Name:</label>
                            <input type="text" id="new-firstname" placeholder="First name">
                        </div>
                        <div class="form-group">
                            <label for="new-lastname">Last Name:</label>
                            <input type="text" id="new-lastname" placeholder="Last name">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-email">Email:</label>
                            <input type="email" id="new-email" placeholder="user@example.com">
                        </div>
                        <div class="form-group">
                            <label for="new-phone">Phone:</label>
                            <input type="tel" id="new-phone" placeholder="+1-555-0000">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-address">Address:</label>
                            <input type="text" id="new-address" placeholder="Street address">
                        </div>
                        <div class="form-group">
                            <label for="new-role">Role:</label>
                            <select id="new-role">
                                <option value="user">Standard User</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-security-question">Security Question (Optional):</label>
                            <select id="new-security-question">
                                <option value="">No security question</option>
                                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                <option value="What was the name of your first school?">What was the name of your first school?</option>
                                <option value="What city were you born in?">What city were you born in?</option>
                                <option value="What is your favorite book?">What is your favorite book?</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-security-answer">Security Answer:</label>
                            <input type="text" id="new-security-answer" placeholder="Answer to selected question">
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="createNewUser()">Create Account</button>
                </div>
                <div id="create-notification" class="notification hidden"></div>
            </div>

            <div class="users-tables">
                <div class="table-section">
                    <h3>Administrators (${admins.length})</h3>
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${admins.map(user => `
                                <tr>
                                    <td>${user.id}</td>
                                    <td>${user.username}</td>
                                    <td>${user.firstName} ${user.lastName}</td>
                                    <td>${user.email}</td>
                                    <td>${user.phone || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="table-section">
                    <h3>Standard Users (${standardUsers.length})</h3>
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Phone</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${standardUsers.map(user => `
                                <tr>
                                    <td>${user.id}</td>
                                    <td>${user.username}</td>
                                    <td>${user.firstName} ${user.lastName}</td>
                                    <td>${user.email}</td>
                                    <td>${user.phone || '-'}</td>
                                    <td>
                                        <button class="btn btn-delete" onclick="deleteStandardUser(${user.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showActivityLogs(container) {
    const logs = getActivityLogs();
    const sortedLogs = [...logs].reverse();

    container.innerHTML = `
        <div class="activity-logs-section">
            <h3>Activity Logs</h3>
            <table class="logs-table">
                <thead>
                    <tr><th>Time</th><th>Username</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${sortedLogs.map(log => {
                        const actionText = log.action || log.status || '';
                        let statusClass = 'status-info';
                        if (actionText.toLowerCase().includes('success') || actionText.toLowerCase().includes('logged in')) statusClass = 'status-success';
                        if (actionText.toLowerCase().includes('failed')) statusClass = 'status-error';
                        if (actionText.toLowerCase().includes('deleted') || actionText.toLowerCase().includes('created')) statusClass = 'status-warning';
                        if (actionText.toLowerCase().includes('updated') || actionText.toLowerCase().includes('mfa')) statusClass = 'status-info';

                        return `
                            <tr>
                                <td>${log.timestamp || log.time || ''}</td>
                                <td>${log.user || ''}</td>
                                <td><span class="status-badge ${statusClass}">${actionText}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            ${logs.length === 0 ? '<p class="no-data">No activity logs found</p>' : ''}
        </div>
    `;
}

function showAuthTrends(container) {
    const logs = getActivityLogs();

    const successCount = logs.filter(l => {
        const txt = (l.action || l.status || '').toLowerCase();
        return txt.includes('logged in successfully') || (txt.includes('success') && !txt.includes('failed'));
    }).length;

    const failureCount = logs.filter(l => {
        const txt = (l.action || l.status || '').toLowerCase();
        return txt.includes('failed');
    }).length;

    const maxCount = Math.max(successCount, failureCount, 1);
    const successPercent = (successCount / maxCount) * 100;
    const failurePercent = (failureCount / maxCount) * 100;

    container.innerHTML = `
        <div class="auth-trends-section">
            <h3>Login Authentication Trends</h3>
            <div class="trends-summary">
                <div class="trend-stat">
                    <span class="trend-label">Successful Logins</span>
                    <span class="trend-count success">${successCount}</span>
                </div>
                <div class="trend-stat">
                    <span class="trend-label">Failed Logins</span>
                    <span class="trend-count error">${failureCount}</span>
                </div>
                <div class="trend-stat">
                    <span class="trend-label">Success Rate</span>
                    <span class="trend-count">${(successCount + failureCount) > 0 ? Math.round((successCount / (successCount + failureCount)) * 100) : 0}%</span>
                </div>
            </div>

            <div class="bar-chart">
                <div class="chart-title">Authentication Status Distribution</div>
                <div class="chart-bars">
                    <div class="bar-group">
                        <div class="bar-label">Successful</div>
                        <div class="bar-container">
                            <div class="bar success" style="width: ${successPercent}%">
                                <span class="bar-value">${successCount}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-label">Failed</div>
                        <div class="bar-container">
                            <div class="bar error" style="width: ${failurePercent}%">
                                <span class="bar-value">${failureCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="trends-details">
                <h4>Recent Activity Breakdown</h4>
                <ul class="activity-list">
                    ${logs.slice(-10).reverse().map(log => `
                        <li>
                            <span class="time">${(log.timestamp || log.time || '').split(', ').pop() || ''}</span>
                            <span class="user">${log.user || ''}</span>
                            <span class="status">${log.action || log.status || ''}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
}

function createNewUser() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-user-password').value;
    const firstName = document.getElementById('new-firstname').value.trim();
    const lastName = document.getElementById('new-lastname').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const phone = document.getElementById('new-phone').value.trim();
    const address = document.getElementById('new-address').value.trim();
    const role = document.getElementById('new-role').value;
    const question = document.getElementById('new-security-question').value;
    const answer = document.getElementById('new-security-answer').value.trim();
    const notification = document.getElementById('create-notification');

    if (!username || !password || !firstName || !lastName || !email || !phone || !address) {
        showAdminNotification('All fields are required', 'error', notification);
        return;
    }

    if (question && !answer) {
        showAdminNotification('Please provide an answer for the selected security question.', 'error', notification);
        return;
    }

    if (!question && answer) {
        showAdminNotification('Please choose a security question or leave the answer blank.', 'error', notification);
        return;
    }

    if (USERS.find(u => u.username === username)) {
        showAdminNotification('Username already exists', 'error', notification);
        return;
    }

    if (!validatePassword(password)) {
        showAdminNotification('Password must have: uppercase, lowercase, number, 8+ chars', 'error', notification);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAdminNotification('Invalid email format', 'error', notification);
        return;
    }

    addNewUser({
        username,
        firstName,
        lastName,
        email,
        phone,
        address,
        hash: password,
        role,
        avatar: String((USERS.length % 5) + 1),
        twoFAQuestion: question || '',
        twoFAAnswer: answer || ''
    });

    showAdminNotification('User created successfully!', 'success', notification);

    document.getElementById('new-username').value = '';
    document.getElementById('new-user-password').value = '';
    document.getElementById('new-firstname').value = '';
    document.getElementById('new-lastname').value = '';
    document.getElementById('new-email').value = '';
    document.getElementById('new-phone').value = '';
    document.getElementById('new-address').value = '';
    document.getElementById('new-security-question').value = '';
    document.getElementById('new-security-answer').value = '';
    document.getElementById('new-role').value = 'user';

    setTimeout(() => {
        const tabContent = document.getElementById('admin-tab-content');
        showUsersManagement(tabContent);
        document.querySelectorAll('.tab-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === 1);
        });
    }, 1000);
}

function showAdminProfile(container) {
    container.innerHTML = `
        <div class="profile-settings-section">
            <div class="dashboard-header">
                <h3>My Admin Profile</h3>
                <p class="subtitle">Edit your account information and security settings</p>
            </div>
            <div class="edit-form-container">
                <div class="form-section">
                    <h4>Account Information</h4>
                    <div class="form-group">
                        <label for="admin-firstname">First Name:</label>
                        <input type="text" id="admin-firstname" value="${currentUser.firstName}">
                    </div>
                    <div class="form-group">
                        <label for="admin-lastname">Last Name:</label>
                        <input type="text" id="admin-lastname" value="${currentUser.lastName}">
                    </div>
                    <div class="form-group">
                        <label for="admin-email">Email:</label>
                        <input type="email" id="admin-email" value="${currentUser.email}">
                    </div>
                    <div class="form-group">
                        <label for="admin-phone">Phone:</label>
                        <input type="tel" id="admin-phone" value="${currentUser.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="admin-address">Address:</label>
                        <input type="text" id="admin-address" value="${currentUser.address || ''}">
                    </div>
                </div>

                <div class="form-section">
                    <h4>Change Password</h4>
                    <div class="form-group">
                        <label for="admin-current-password">Current Password:</label>
                        <input type="password" id="admin-current-password" placeholder="Enter current password">
                    </div>
                    <div class="form-group">
                        <label for="admin-new-password">New Password:</label>
                        <input type="password" id="admin-new-password" placeholder="8+ chars, uppercase, lowercase, number">
                    </div>
                    <div class="form-group">
                        <label for="admin-confirm-password">Confirm Password:</label>
                        <input type="password" id="admin-confirm-password" placeholder="Confirm new password">
                    </div>
                </div>

                <div class="form-section">
                    <h4>Security Question Settings (Optional)</h4>
                    <div class="form-group">
                        <label for="admin-security-question">Security Question:</label>
                        <select id="admin-security-question">
                            <option value="" ${!currentUser.twoFAQuestion ? 'selected' : ''}>No security question</option>
                            <option value="What was the name of your first pet?" ${currentUser.twoFAQuestion === 'What was the name of your first pet?' ? 'selected' : ''}>What was the name of your first pet?</option>
                            <option value="What is your mother's maiden name?" ${currentUser.twoFAQuestion === "What is your mother's maiden name?" ? 'selected' : ''}>What is your mother's maiden name?</option>
                            <option value="What was the name of your first school?" ${currentUser.twoFAQuestion === 'What was the name of your first school?' ? 'selected' : ''}>What was the name of your first school?</option>
                            <option value="What city were you born in?" ${currentUser.twoFAQuestion === 'What city were you born in?' ? 'selected' : ''}>What city were you born in?</option>
                            <option value="What is your favorite book?" ${currentUser.twoFAQuestion === 'What is your favorite book?' ? 'selected' : ''}>What is your favorite book?</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="admin-security-answer">Security Answer:</label>
                        <input type="text" id="admin-security-answer" value="${currentUser.twoFAAnswer || ''}">
                        <small class="form-help">Leave both blank to disable security question protection.</small>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn btn-primary" onclick="saveAdminProfileChanges()">Save Changes</button>
                    <button class="btn btn-secondary" onclick="switchAdminTab('overview', document.querySelector('.tab-btn'))">Cancel</button>
                </div>
            </div>
            <div id="admin-profile-notification" class="notification hidden"></div>
        </div>
    `;
}

function saveAdminProfileChanges() {
    const firstName = document.getElementById('admin-firstname').value.trim();
    const lastName = document.getElementById('admin-lastname').value.trim();
    const email = document.getElementById('admin-email').value.trim();
    const phone = document.getElementById('admin-phone').value.trim();
    const address = document.getElementById('admin-address').value.trim();
    const currentPass = document.getElementById('admin-current-password').value;
    const newPass = document.getElementById('admin-new-password').value;
    const confirmPass = document.getElementById('admin-confirm-password').value;
    const question = document.getElementById('admin-security-question').value;
    const answer = document.getElementById('admin-security-answer').value.trim();
    const notification = document.getElementById('admin-profile-notification');

    if (!firstName || !lastName || !email) {
        showAdminNotification('First name, last name, and email are required', 'error', notification);
        return;
    }

    if ((question && !answer) || (!question && answer)) {
        showAdminNotification('Please supply both a security question and answer, or leave both blank.', 'error', notification);
        return;
    }

    if (newPass || confirmPass || currentPass) {
        if (!currentPass || !newPass || !confirmPass) {
            showAdminNotification('All password fields are required to change password.', 'error', notification);
            return;
        }
        if (currentPass !== currentUser.hash) {
            showAdminNotification('Current password is incorrect.', 'error', notification);
            return;
        }
        if (!validatePassword(newPass)) {
            showAdminNotification('New password must have uppercase, lowercase, number, and be at least 8 chars.', 'error', notification);
            return;
        }
        if (newPass !== confirmPass) {
            showAdminNotification('New passwords do not match.', 'error', notification);
            return;
        }
        currentUser.hash = newPass;
    }

    const updates = {
        firstName,
        lastName,
        email,
        phone,
        address,
        twoFAQuestion: question || '',
        twoFAAnswer: answer || ''
    };

    if (updateUserProfile(currentUser.id, updates)) {
        Object.assign(currentUser, updates);
        document.getElementById('admin-name-display').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
        showAdminNotification('Profile updated successfully!', 'success', notification);
    } else {
        showAdminNotification('Unable to update profile.', 'error', notification);
    }
}

function deleteStandardUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        if (deleteUser(userId)) {
            showUsersManagement(document.getElementById('admin-tab-content'));
        }
    }
}

function showAdminNotification(message, type, container) {
    if (!container) return;

    let notif = container;
    if (!notif.classList.contains('notification')) {
        notif = container.querySelector('.notification') || container.querySelector('#create-notification') || container.querySelector('#admin-profile-notification');
    }

    if (!notif) {
        notif = document.createElement('div');
        notif.className = 'notification';
        container.appendChild(notif);
    }

    notif.innerText = message;
    notif.className = `notification ${type}`;
    notif.classList.remove('hidden');

    setTimeout(() => { notif.classList.add('hidden'); }, 3000);
}
