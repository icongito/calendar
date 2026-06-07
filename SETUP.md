# Focus Calendar — Setup Guide

## Prerequisites
- Node.js 18+ and npm 9+
- A Google account
- macOS (the app is optimized for macOS)

## 1. Clone & Install
```bash
git clone <repo-url>
cd focus-calendar
npm install
```

## 2. Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project → New Project**
3. Name it "Focus Calendar" and click **Create**

## 3. Enable Required APIs
In your new project, enable these APIs (APIs & Services → Library):
- **Google Calendar API**
- **Google Classroom API**
- **Google OAuth2 API** (usually enabled by default)

## 4. Configure OAuth Consent Screen
1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** user type
3. Fill in:
   - App name: `Focus Calendar`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. On the Scopes page, add these scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
   - `https://www.googleapis.com/auth/classroom.student-submissions.me.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
6. Add your Google account as a **Test user**

## 5. Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Desktop app**
4. Name: `Focus Calendar Desktop`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## 6. Configure Environment Variables
Create a `.env` file in the project root:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## 7. Run the App
```bash
npm run dev
```

## 8. Build for Distribution
```bash
npm run build
```

## Troubleshooting
- **"This app isn't verified"**: Click "Advanced → Go to Focus Calendar (unsafe)" during the OAuth flow. This is expected for personal apps in testing mode.
- **Classroom not showing**: Make sure Google Classroom integration is enabled in Settings and your Google account has active Classroom courses.
- **Events not loading**: Check that Calendar API is enabled in your Google Cloud project.
