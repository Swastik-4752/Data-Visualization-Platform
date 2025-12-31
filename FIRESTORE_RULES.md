# Firestore Security Rules Setup

To fix the "Missing or insufficient permissions" error, you need to configure Firestore security rules in the Firebase Console.

## Steps to Configure Firestore Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `omkar-b1a87`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Analyses collection - users can only read/write their own analyses
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

6. Click **Publish** to save the rules

## What these rules do:

- **Authentication Required**: Only authenticated users can access the `analyses` collection
- **User Isolation**: Users can only read and write analyses where the `userId` field matches their own user ID
- **Secure**: Prevents users from accessing or modifying other users' data

## Alternative (Temporary Development Rules):

If you're still in development and want to test quickly, you can use these more permissive rules (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analyses/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

These allow any authenticated user to read/write any analysis. Use the first set of rules for production.

