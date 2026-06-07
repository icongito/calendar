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

- **macOS** (notifications and vibrancy are Mac-specific)
- **Node.js 18+** and **npm 9+**
- Check your Node version: `node -v` — if it says v16 or lower, install the latest from [nodejs.org](https://nodejs.org)

---

## Launch (no Google account needed)

The app works fully offline with manual events. Google Calendar is optional.

```bash
# 1. Clone the repo
git clone https://github.com/icongito/calendar.git
cd calendar

# 2. Install dependencies (takes ~1–2 min first time)
npm install

# 3. Create a .env file (can be empty if skipping Google)
cp .env.example .env

# 4. Run the app
npm run dev
```

The app window opens automatically. You'll see mock events on the first run.

**Adding events manually** — click the `+` button next to today's date. You can type a title, pick a time, write notes, and attach a screenshot of the task.

---

## Optional: connect Google Calendar

If you want real calendar events pulled in automatically, you'll need a personal Gmail account (`@gmail.com`) to set up Google Cloud credentials. School/work Google Workspace accounts often block the Cloud Console.

---

## Setting up Google OAuth credentials

> Skip this entire section if you just want to use manual events.

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
npm run dev       # development with hot reload
npm run build     # production build → out/
```

Once Google credentials are in `.env`, go to the **⚙ Settings** tab → **Connect Google Account**. A browser window opens for the OAuth flow. After authorizing, your events load automatically and refresh every 5 minutes.

---

## Adding events manually

No Google account required. Click the **`+`** button in the Today view header:

- **Title** — what the task is
- **Date + time** — or toggle "All day"
- **Description** — notes, links, whatever
- **Screenshot** — drag a photo onto the upload area or click to browse. The image shows as a thumbnail on the card and full-size in Focus Mode.
- **Color** — pick from 6 swatches to color-code by subject or priority

Events are saved locally and persist between app restarts.

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
