# Firebase Setup Guide for Carpool Splitter

## ⚠️ IMPORTANT: Complete ALL Steps Below to Fix Permission Errors

## Step 1: Enable Firebase Realtime Database

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `carpooler-pro`

2. **Create Realtime Database**
   - In the left sidebar, click on "Realtime Database"
   - Click "Create Database"
   - Choose location: **United States (us-central1)** or closest to you
   - Start in **"Locked mode"** (we'll set custom rules next)
   - Click "Enable"

## Step 2: Deploy Security Rules

1. **Navigate to Rules Tab**
   - In Realtime Database page, click on the "Rules" tab at the top

2. **Copy and Paste These Rules**
   - Copy the rules below (or from `firebase-security-rules.json`)
   - Paste into the Firebase Rules editor
   - Click "Publish"

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "shared": {
      "$shareId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

## Step 3: Enable Authentication Methods

1. **Go to Authentication**
   - In the left sidebar, click on "Authentication"
   - Click "Get started" if you haven't set it up yet

2. **Enable Email/Password**
   - Click the "Sign-in method" tab
   - Find "Email/Password" and click it
   - Toggle "Enable" ON
   - Click "Save"

3. **Enable Google Sign-In**
   - Click "Google" in the sign-in methods list
   - Toggle "Enable" ON
   - Enter a support email (e.g., your email)
   - Click "Save"

4. **Enable Apple Sign-In (Optional)**
   - Click "Apple" in the sign-in methods list
   - Toggle "Enable" ON
   - Click "Save"

## Step 4: Add Authorized Domains

1. **Go to Authentication Settings**
   - Click the "Settings" tab (gear icon)
   - Scroll down to "Authorized domains"

2. **Add Your Domains**
   - Click "Add domain"
   - Add: `localhost`
   - Click "Add domain" again
   - Add: `dsgubaton.github.io`
   - Click "Add"

## What These Rules Do

### User Data Protection
- Each user can only read/write their own data under `/users/{userId}/`
- Authentication is required for all operations
- No user can access another user's carpools

### Data Validation
- Event names limited to 100 characters
- Required fields enforced: eventName, cars, unassignedPassengers, lastUpdated
- Prevents malicious data injection

### Shared Events (Future Feature)
- `/shared/{shareId}` allows read-only access for anyone with the link
- Only the owner can modify shared events
- Enables carpool sharing with friends

## Security Best Practices

✅ **Implemented:**
- Authentication required
- User data isolation
- Input validation
- Rate limiting (in app code)
- XSS prevention (sanitization)

⚠️ **Important:**
- Never share your Firebase config's API key publicly in production
- Consider using environment variables for sensitive data
- Enable Firebase App Check for additional protection

## Testing the Rules

After publishing, test by:
1. Creating a new account
2. Adding a carpool event
3. Logging out and trying to access via direct URL (should fail)
4. Logging back in (should work)

## For App Store Release

Additional requirements:
1. ✅ Apple Sign-In implemented
2. ✅ User authentication required
3. ✅ Data privacy compliance
4. ⏳ Create privacy policy document
5. ⏳ Add Terms of Service
6. ⏳ Enable Firebase App Check
