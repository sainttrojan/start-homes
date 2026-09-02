# Start Homes

Start Homes is a modern real estate platform that enables users to browse, search, and view properties, as well as submit viewing inquiries and property listing requests. It features a secure administrative dashboard for managing listings and customer interactions.

## Architecture

This project is built as a static web application that interfaces directly with Firebase Firestore. It utilizes Firestore Security Rules to ensure that all database operations are secure. The architecture eliminates the need for a dedicated backend server, making it ideal for high-performance deployment on Edge networks like Cloudflare Pages.

- Frontend: HTML5, CSS3, Vanilla JavaScript, Tailwind CSS.
- Backend/Database: Firebase Firestore (NoSQL).
- Authentication: Firebase Authentication.
- Hosting: Cloudflare Pages.

## Features

- Public Property Listings: Browse properties with dynamic filtering by city, type, and price.
- Dynamic Property Details: View comprehensive information and image galleries for individual properties.
- Lead Generation: Securely submit viewing requests and property sale requests.
- Secure Admin Dashboard: Authenticated dashboard for managing properties and viewing client inquiries.

## Security Implementation

The application employs a secure client-side model:
- The Firebase config variables are public by design.
- All data access is strictly governed by Firestore Security Rules.
- Public users are restricted to read-only access for properties and create-only access for their own inquiries.
- Administrative capabilities (Insert, Update, Delete) require a valid authenticated session.

## Deployment

The application is designed to be hosted on any static hosting provider.

1. Cloudflare Pages (Recommended): Connect this repository to Cloudflare Pages and deploy. No build step is required.
2. GitHub Pages / Vercel / Netlify: Serve the root directory as a static site.

All database interactions will automatically utilize the configured Firebase endpoints initialized from the Admin panel settings.

## Database Security Rules

To replicate the required database architecture and secure your data, navigate to the Rules tab in your Firebase Firestore console and apply the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /inquiries/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /seller_requests/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```
