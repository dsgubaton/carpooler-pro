# Firebase Security Rules Setup

## How to Deploy Security Rules to Firebase

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `carbooler`

2. **Navigate to Realtime Database Rules**
   - In the left sidebar, click on "Realtime Database"
   - Click on the "Rules" tab at the top

3. **Copy and Paste the Rules**
   - Open the file: `firebase-security-rules.json`
   - Copy the entire contents
   - Paste into the Firebase Rules editor
   - Click "Publish"

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
