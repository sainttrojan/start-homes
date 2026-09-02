# Start Homes - Real Estate Platform

A fully functional real estate platform built with modern, lightweight technologies to operate efficiently with a serverless architecture.

## Technologies Used

- **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN)
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Authentication
- **Image Hosting:** ImgBB API (Direct client-to-cloud upload)
- **Hosting:** Cloudflare Pages (Integrated with GitHub)

## Key Features

1. **Admin Dashboard:**
   - Add, edit, and delete properties with detailed financial breakdowns (total price, paid amount, overprice, remaining amount, installments).
   - View customer inquiries and viewing requests.
   - Review seller requests and publish them directly to the platform.
   - Fully secured using Firebase Authentication and Firestore Security Rules.

2. **Image Management:**
   - Integrates with ImgBB API to handle image uploads without relying on Firebase Storage billing.
   - Images are uploaded directly from the browser, and the resulting URLs are stored in Firestore.

3. **User Interface:**
   - Responsive design with Dark/Light mode support.
   - Advanced filtering and search system for properties.
   - Local storage-based "Favorites" system for users to save properties.

## Setup Instructions

To deploy and run the system, it must be connected to a Firebase project and an ImgBB account.

### 1. Firebase Configuration
1. Navigate to the Firebase Console and create a new project.
2. Enable **Firestore Database** and **Authentication** (Email/Password provider).
3. In the Firestore Rules tab, apply the following security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /properties/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /inquiries/{document=**} {
         allow read: if request.auth != null;
         allow write: if true;
       }
       match /seller_requests/{document=**} {
         allow read: if request.auth != null;
         allow write: if true;
       }
     }
   }
   ```
4. Copy the `firebaseConfig` object from your Project Settings.

### 2. ImgBB Configuration
1. Create a free account at ImgBB API.
2. Generate an API Key for image uploads.

### 3. Application Linkage
1. Open the `admin.html` page in your deployed environment.
2. On the login screen, click the "Update Firebase Settings" button.
3. Paste the `firebaseConfig` JSON and the `ImgBB API Key`.
4. Click Save. The application will refresh and connect to your database. You can now log in using your Firebase Authentication credentials.

## Directory Structure

- `index.html` - Homepage and quick search.
- `latest-units.html` - Property browsing and filtering page.
- `property-details.html` - Individual property details and financial breakdown.
- `sell-property.html` - Form for owners to submit properties for sale.
- `admin.html` - Secure administration dashboard.
- `js/firebase-config.js` - Database connection and image upload logic.
- `js/admin.js` - Administrative operations and dashboard state management.
