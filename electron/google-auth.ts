import { BrowserWindow } from 'electron'
import { createServer } from 'http'
import { URL } from 'url'
import Store from 'electron-store'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

const PORT = 8888
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`

export async function setupGoogleAuth(
  store: Store<Record<string, unknown>>,
  parentWindow: BrowserWindow | null
): Promise<{ email: string; avatar: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.')
  }

  const { google } = await import('googleapis')
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })

  return new Promise((resolve, reject) => {
    let authWindow: BrowserWindow | null = null

    const server = createServer(async (req, res) => {
      if (!req.url?.startsWith('/oauth2callback')) return
      const url = new URL(req.url, `http://localhost:${PORT}`)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:40px">
        <h2>${error ? 'Authorization cancelled' : 'Authorization successful!'}</h2>
        <p>${error ? 'You can close this window.' : 'You can close this window and return to Focus Calendar.'}</p>
      </body></html>`)

      server.close()
      authWindow?.close()

      if (error || !code) {
        reject(new Error(error || 'No code received'))
        return
      }

      try {
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)
        store.set('googleTokens', tokens)

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
        const userInfo = await oauth2.userinfo.get()

        const result = {
          email: userInfo.data.email || '',
          avatar: userInfo.data.picture || '',
        }

        const currentSettings = store.get('settings') as Record<string, unknown>
        store.set('settings', {
          ...currentSettings,
          connectedEmail: result.email,
          connectedAvatar: result.avatar,
        })

        resolve(result)
      } catch (err) {
        reject(err)
      }
    })

    server.listen(PORT)

    authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      parent: parentWindow || undefined,
      modal: true,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    authWindow.loadURL(authUrl)
    authWindow.on('closed', () => {
      server.close()
      reject(new Error('Auth window closed'))
    })
  })
}
