# 🔐 Secure Auth System - Dark Dashboard

A comprehensive, production-grade authentication system with a full dark-themed dashboard featuring user profile management, admin controls, and activity logging.

## ✨ Features Implemented

### 1. **Enhanced Authentication**
- ✅ Strict password requirements (uppercase, lowercase, number, 8+ chars)
- ✅ 3-attempt login lockout with 30-second cooldown
- ✅ Multi-Factor Authentication (MFA) via security questions
- ✅ Session management with localStorage

### 2. **Expanded User Data Structure**
Each user now includes:
- First Name & Last Name
- Email Address
- Phone Number
- Physical Address
- Avatar ID (emoji avatars)
- Security Question & Answer
- 2FA Question & Answer

### 3. **User Dashboard**
- 📊 **Dashboard View**: Display full extended profile information
- ✏️ **Edit Profile**: 
  - Select from 5 emoji avatars
  - Update personal information
  - Change password with validation
  - Update 2FA questions
  - Success notifications
- 🚪 **Navigation Menu**: Dashboard, Edit Profile, Logout

### 4. **Admin Dashboard**
- 📈 **Overview Tab**: Quick statistics on total users, activity logs, system status
- 👥 **Users Tab**:
  - **Create Account Form**: Add new users dynamically with all profile fields
  - **Administrators Table**: View all admin users
  - **Standard Users Table**: View standard users with delete functionality
- 📋 **Activity Logs Tab**: 
  - Structured table format (Time, Username, Status)
  - Color-coded status badges:
    - 🟢 Green: Success
    - 🔴 Red: Failed/Error
    - 🟡 Orange: Created/Deleted
    - 🔵 Blue: Info/Updated
- 📊 **Auth Trends Tab**:
  - Login success/failure statistics
  - Success rate percentage
  - Visual bar chart representation
  - Recent activity breakdown

## 📁 File Structure

```
IAS Website/
├── index.html         # Main entry point with all UI sections
├── auth.js            # Authentication logic (login, MFA, lockout)
├── dashboard.js       # User dashboard & profile editing
├── admin.js           # Admin dashboard & user management
├── theme.css          # Dark-themed styling (1200+ lines)
└── README.md          # This file
```

## 🚀 Getting Started

### Demo Credentials

**Admin User:**
- Username: `admin1`
- Password: `Admin@123`

**Standard User:**
- Username: `user1`
- Password: `Userpass1`

### How to Use

1. **Opening the System**
   - Open `index.html` in a web browser
   - Enter demo credentials

2. **Login Process**
   - Enter username & password
   - Answer security question
   - Access appropriate dashboard

## 🚢 GitHub Pages Deployment

1. Push the repository to GitHub.
2. In the repository `Settings`, open `Pages`.
3. Choose the `main` branch and `/ (root)` folder.
4. GitHub Pages will automatically serve `index.html` as the site entry point.

3. **User Dashboard**
   - View extended profile information
   - Click "Edit Profile" to update information
   - Change password and 2FA settings
   - See success notifications on save

4. **Admin Dashboard**
   - **Overview**: See system statistics
   - **Users**: Create new accounts, manage user list
   - **Activity Logs**: View all system events with status indicators
   - **Auth Trends**: See login statistics and trends

## 🎨 Dark Theme Features

- Deep dark background (#0f1419)
- Professional color scheme with accent blues
- Status-based color coding:
  - Success: Green (#10b981)
  - Error: Red (#ef4444)
  - Warning: Orange (#f59e0b)
  - Info: Blue (#3b82f6)
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)

## 🔒 Security Features

1. **Password Complexity**: Enforced strong password requirements
2. **Brute Force Protection**: 3-attempt lockout with 30-second cooldown
3. **Multi-Factor Authentication**: Security questions for additional verification
4. **Session Management**: Secure session tracking with sessionStorage
5. **Input Validation**: Email format, required fields, password confirmation
6. **Activity Logging**: Complete audit trail of all system events

## 💾 Data Persistence

- **User Profiles**: Stored in `USERS` array (can be replaced with backend API)
- **Activity Logs**: Persisted in localStorage for audit trail
- **Session State**: Stored in sessionStorage for security

## 🎯 User Roles

### Admin Users
- Full access to admin dashboard
- Can create new user accounts
- Can delete standard users
- Can view all activity logs
- Can see authentication trends

### Standard Users
- Access to personal dashboard
- Can edit own profile
- Can change password
- Can update security questions
- Cannot access admin features

## 📊 Data Models

### User Object
```javascript
{
    id: Number,
    username: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    hash: String,           // Password hash
    role: "admin" | "user",
    avatar: String,         // Avatar ID
    secQ: String,           // Security question
    secA: String,           // Security answer
    twoFAQuestion: String,  // 2FA question
    twoFAAnswer: String     // 2FA answer
}
```

### Activity Log Object
```javascript
{
    user: String,      // Username
    status: String,    // Action description
    time: String       // Timestamp
}
```

## 🔧 Functions Reference

### Auth Functions (auth.js)
- `handleLogin()` - Process login credentials
- `verifyMFA()` - Verify security answer
- `logout()` - Clear session and reload
- `validatePassword(pass)` - Check password strength
- `getUserById(id)` - Retrieve user by ID
- `addNewUser(userData)` - Create new user
- `deleteUser(userId)` - Remove user account
- `getActivityLogs()` - Retrieve all logs

### Dashboard Functions (dashboard.js)
- `loadUserDashboard()` - Initialize user dashboard
- `showDashboardView()` - Display profile view
- `showEditProfileView()` - Display edit form
- `saveProfileChanges()` - Save profile updates
- `navigateDashboard(section)` - Handle navigation

### Admin Functions (admin.js)
- `loadAdminDashboard()` - Initialize admin dashboard
- `switchAdminTab(tab)` - Switch between admin tabs
- `createNewUser()` - Create user via admin form
- `deleteStandardUser(userId)` - Remove user as admin
- `showActivityLogs(container)` - Display activity logs
- `showAuthTrends(container)` - Display auth statistics

## 📱 Responsive Design

The system is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎯 Next Steps (Production Ready)

To make this production-ready:
1. Replace `USERS` array with backend API calls
2. Implement JWT token authentication instead of sessionStorage
3. Use bcrypt for password hashing (not plaintext)
4. Add database layer (PostgreSQL, MongoDB, etc.)
5. Implement HTTPS/SSL
6. Add rate limiting on login attempts
7. Implement password reset functionality
8. Add email verification
9. Use proper secret key management
10. Add CSRF protection

## 📝 Version History

- **v1.0** (Current): Initial dark-themed dashboard release
  - Full user & admin dashboards
  - Profile editing with validation
  - Activity logging with color-coded statuses
  - Authentication trends visualization

## 🤝 Contributing

This is a demonstration system. For modifications:
1. Update USERS array for new test accounts
2. Modify CSS variables in `:root` for theme changes
3. Add new functions to extend functionality

## 📄 License

This is a demonstration project for educational purposes.

---

**Last Updated**: May 8, 2026
**System Status**: ✅ Fully Operational
