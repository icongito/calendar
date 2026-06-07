# Focus Calendar

A personal focus calendar for macOS, living in your menu bar. Pulls events from Google Calendar and Google Classroom into a distraction-free, light-themed interface built for deep work.

Built with Electron + React + TypeScript.

---

## What it does

- **Today View** — shows your top 3 most urgent events as focus cards, then the rest as a timeline. Completed events dim in place.
- **Week View** — 7-column grid with color-coded event chips. Click any event for details.
- **Focus Mode** — full-window overlay for a single task with a live countdown timer and a breathing animation.
- **Smart Reminders** — native macOS notifications at 1 day, 2 hours, 30 minutes, and 5 minutes before each event. Clicking "Focus Now" jumps straight into Focus Mode.
- **Google Classroom** — assignments appear as all-day events with a purple "Classroom" badge, merged into the same timeline as calendar events.
- **Menu bar tray** — shows a badge with how many events remain today. Click to show/hide the window.
- **Offline mode** — shows cached events with a banner when Google is unreachable.

---

## Prerequisites

- **macOS** (the app targets macOS; Electron will run on other platforms but notifications and vibrancy are Mac-specific)
- **Node.js 18+** and **npm 9+**
- A **Google account**
- A **Google Cloud project** with Calendar and Classroom APIs enabled (steps below)

---

## Quick start

```bash
git clone https://github.com/icongito/calendar.git
cd calendar
npm install
cp .env.example .env
# fill in your credentials in .env (see below)
npm run dev
```

---

## Setting up Google OAuth credentials

The app reads from Google Calendar and Google Classroom using OAuth 2.0. You need your own credentials — they stay on your machine and are never shared.

### 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project → New Project**
3. Name it `Focus Calendar`, click **Create**

### 2. Enable APIs

In your project, go to **APIs & Services → Library** and enable:

- **Google Calendar API**
- **Google Classroom API**

### 3. Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External**, click **Create**
3. Fill in:
   - App name: `Focus Calendar`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. On the **Scopes** step, add these scopes:
   ```
   https://www.googleapis.com/auth/calendar.readonly
   https://www.googleapis.com/auth/classroom.courses.readonly
   https://www.googleapis.com/auth/classroom.coursework.me.readonly
   https://www.googleapis.com/auth/classroom.student-submissions.me.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
6. On the **Test users** step, add your own Google email
7. Click **Save and Continue**

### 4. Create OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Desktop app**
4. Name: `Focus Calendar Desktop`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 5. Add credentials to `.env`

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

> `.env` is gitignored — it will never be committed.

---

## Running the app

```bash
npm run dev       # development (hot reload)
npm run build     # production build → out/
```

On first launch, go to the **⚙ Settings** tab and click **Connect Google Account**. A browser window will open for the OAuth flow. After authorizing, your events load automatically.

---

## Troubleshooting

**"This app isn't verified"** — Click **Advanced → Go to Focus Calendar (unsafe)**. This is normal for personal apps in Google's test mode.

**Classroom not showing** — Toggle "Enable Classroom" on in Settings, and make sure your account has active Classroom courses.

**Events not loading** — Check that both APIs are enabled in your Google Cloud project and the OAuth scopes were added correctly.

**Token errors on restart** — The app silently refreshes expired tokens. If it fails, go to Settings → Disconnect and reconnect.

---

## Tech stack

| Layer | Library |
|---|---|
| Desktop shell | [Electron](https://www.electronjs.org/) |
| Frontend | React 18 + TypeScript |
| Build | [electron-vite](https://electron-vite.org/) + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Dates | dayjs |
| Persistence | electron-store |
| Google APIs | googleapis |

---

## Project structure

```
electron/
  main.ts          # main process: window, tray, IPC, notifications
  preload.ts       # secure contextBridge API
  google-auth.ts   # OAuth2 flow

src/
  views/
    TodayView.tsx
    WeekView.tsx
    SettingsView.tsx
  components/
    TaskCard.tsx
    CountdownBadge.tsx
    FocusMode.tsx
    Sidebar.tsx
  hooks/
    useGoogleCalendar.ts
    useReminders.ts
  store/
    useAppStore.ts
```
