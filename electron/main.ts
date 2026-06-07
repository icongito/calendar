import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { setupGoogleAuth } from './google-auth'
import type { AppSettings, CalendarEvent } from '../src/types'

const store = new Store<{
  settings: AppSettings
  googleTokens: { access_token: string; refresh_token: string; expiry_date: number } | null
  cachedEvents: CalendarEvent[]
  doneEventIds: string[]
}>({
  defaults: {
    settings: {
      enabledCalendarIds: [],
      classroomEnabled: false,
      reminderIntervals: {
        oneDay: true,
        twoHours: true,
        thirtyMinutes: true,
        fiveMinutes: true,
      },
      launchAtLogin: false,
      alwaysOnTop: false,
      windowOpacity: 100,
    },
    googleTokens: null,
    cachedEvents: [],
    doneEventIds: [],
  },
})

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
const scheduledNotifications = new Map<string, ReturnType<typeof setTimeout>>()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 700,
    minWidth: 380,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FAF9F7',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  const settings = store.get('settings')
  if (settings.alwaysOnTop) {
    mainWindow.setAlwaysOnTop(true)
  }

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

function createTray() {
  const icon = nativeImage.createFromDataURL(getTrayIconDataURL(0))
  tray = new Tray(icon)
  tray.setToolTip('Focus Calendar')

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Focus Calendar', click: () => { mainWindow?.show(); mainWindow?.focus() } },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ])
    tray?.popUpContextMenu(contextMenu)
  })
}

function getTrayIconDataURL(count: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <rect x="2" y="3" width="18" height="16" rx="2" fill="none" stroke="#333" stroke-width="1.5"/>
    <line x1="2" y1="8" x2="20" y2="8" stroke="#333" stroke-width="1.5"/>
    <line x1="7" y1="2" x2="7" y2="5" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="15" y1="2" x2="15" y2="5" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
    ${count > 0 ? `<circle cx="17" cy="5" r="4" fill="#D4600A"/>
    <text x="17" y="8.5" text-anchor="middle" fill="white" font-size="5" font-family="sans-serif">${count > 9 ? '9+' : count}</text>` : ''}
  </svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function updateTrayBadge(count: number) {
  if (!tray) return
  const icon = nativeImage.createFromDataURL(getTrayIconDataURL(count))
  tray.setImage(icon)
}

// IPC Handlers
ipcMain.handle('google:isConnected', () => {
  const tokens = store.get('googleTokens')
  return !!tokens
})

ipcMain.handle('google:connect', async () => {
  return setupGoogleAuth(store, mainWindow)
})

ipcMain.handle('google:disconnect', () => {
  store.set('googleTokens', null)
  const current = store.get('settings')
  store.set('settings', { ...current, connectedEmail: undefined, connectedAvatar: undefined })
})

ipcMain.handle('google:getEvents', async (_event, startDate: string, endDate: string) => {
  const tokens = store.get('googleTokens')
  if (!tokens) throw new Error('Not authenticated')

  try {
    const { google } = await import('googleapis')
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:8888/oauth2callback'
    )
    oauth2Client.setCredentials(tokens)

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const doneIds: string[] = store.get('doneEventIds') || []
    const events = (response.data.items || []).map((item) => ({
      id: item.id,
      title: item.summary || 'Untitled',
      description: item.description,
      start: item.start?.dateTime ? new Date(item.start.dateTime) : new Date(item.start?.date || ''),
      end: item.end?.dateTime ? new Date(item.end.dateTime) : new Date(item.end?.date || ''),
      isAllDay: !item.start?.dateTime,
      calendarId: 'primary',
      calendarColor: '#4285F4',
      source: 'google' as const,
      htmlLink: item.htmlLink,
      location: item.location,
      isDone: doneIds.includes(item.id || ''),
    }))

    store.set('cachedEvents', events)
    const pendingCount = events.filter((e) => !e.isDone).length
    updateTrayBadge(pendingCount)

    return events
  } catch (_error) {
    const cached = store.get('cachedEvents')
    if (cached?.length) return cached
    throw _error
  }
})

ipcMain.handle('google:getClassroomWork', async () => {
  const tokens = store.get('googleTokens')
  if (!tokens) throw new Error('Not authenticated')

  const { google } = await import('googleapis')
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:8888/oauth2callback'
  )
  oauth2Client.setCredentials(tokens)

  const classroom = google.classroom({ version: 'v1', auth: oauth2Client })
  const coursesRes = await classroom.courses.list({ studentId: 'me', courseStates: ['ACTIVE'] })
  const courses = coursesRes.data.courses || []

  const assignments: Array<{
    id: string | null | undefined
    courseId: string | null | undefined
    courseName: string | null | undefined
    title: string | null | undefined
    dueDate: Date | undefined
    maxPoints: number | null | undefined
    link: string | null | undefined
  }> = []

  for (const course of courses) {
    try {
      const workRes = await classroom.courses.courseWork.list({ courseId: course.id! })
      const workItems = workRes.data.courseWork || []
      for (const work of workItems) {
        assignments.push({
          id: work.id,
          courseId: course.id,
          courseName: course.name,
          title: work.title,
          dueDate: work.dueDate
            ? new Date(work.dueDate.year!, work.dueDate.month! - 1, work.dueDate.day!)
            : undefined,
          maxPoints: work.maxPoints,
          link: work.alternateLink,
        })
      }
    } catch {
      // skip courses with errors
    }
  }

  return assignments
})

ipcMain.handle('settings:get', () => store.get('settings'))

ipcMain.handle('settings:save', (_event, newSettings: Partial<AppSettings>) => {
  const current = store.get('settings')
  const merged = { ...current, ...newSettings }
  store.set('settings', merged)

  if (newSettings.launchAtLogin !== undefined) {
    app.setLoginItemSettings({ openAtLogin: newSettings.launchAtLogin })
  }
})

ipcMain.on('window:setAlwaysOnTop', (_event, value: boolean) => {
  mainWindow?.setAlwaysOnTop(value)
})

ipcMain.on('reminder:schedule', (_event, event: CalendarEvent, minutesBefore: number) => {
  const key = `${event.id}-${minutesBefore}`
  if (scheduledNotifications.has(key)) return

  const targetTime = new Date(event.start).getTime() - minutesBefore * 60 * 1000
  const delay = targetTime - Date.now()

  if (delay <= 0 || delay > 48 * 60 * 60 * 1000) return

  const timeout = setTimeout(() => {
    const label =
      minutesBefore >= 1440
        ? '1 day'
        : minutesBefore >= 60
        ? `${minutesBefore / 60} hours`
        : `${minutesBefore} minutes`

    const notification = new Notification({
      title: event.title,
      body: `${event.title} starts in ${label}`,
      actions: [{ type: 'button', text: 'Focus Now' }],
    })

    notification.on('action', () => {
      mainWindow?.show()
      mainWindow?.focus()
      mainWindow?.webContents.send('focus-event', event.id)
    })

    notification.show()
    scheduledNotifications.delete(key)
  }, delay)

  scheduledNotifications.set(key, timeout)
})

app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', (e: Event) => {
  e.preventDefault()
})

app.on('activate', () => {
  mainWindow?.show()
})
