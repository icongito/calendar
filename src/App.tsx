import React, { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { Sidebar } from './components/Sidebar'
import { FocusMode } from './components/FocusMode'
import { TodayView } from './views/TodayView'
import { WeekView } from './views/WeekView'
import { SettingsView } from './views/SettingsView'
import { useGoogleCalendar } from './hooks/useGoogleCalendar'
import { useReminders } from './hooks/useReminders'
import type { ManualEvent } from './types'

export default function App() {
  const currentView = useAppStore((s) => s.currentView)
  const focusEventId = useAppStore((s) => s.focusEventId)
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const setIsGoogleConnected = useAppStore((s) => s.setIsGoogleConnected)
  const setManualEvents = useAppStore((s) => s.setManualEvents)

  useGoogleCalendar()
  useReminders()

  useEffect(() => {
    const electronAPI = (window as Window & {
      electronAPI?: {
        isGoogleConnected: () => Promise<boolean>
        getSettings: () => Promise<Record<string, unknown>>
        getManualEvents: () => Promise<ManualEvent[]>
      }
      ipcRenderer?: {
        on: (channel: string, listener: (...args: unknown[]) => void) => void
      }
    }).electronAPI

    if (!electronAPI) return

    electronAPI.isGoogleConnected().then((connected: boolean) => {
      setIsGoogleConnected(connected)
    })

    electronAPI.getSettings().then((savedSettings: Record<string, unknown>) => {
      if (savedSettings) setSettings(savedSettings as Parameters<typeof setSettings>[0])
    })

    electronAPI.getManualEvents().then((events: ManualEvent[]) => {
      if (events) {
        // Deserialize dates from JSON
        const deserialized = events.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }))
        setManualEvents(deserialized)
      }
    })

    // Listen for focus mode trigger from notification
    const handleFocusEvent = (_event: unknown, eventId: string) => {
      useAppStore.getState().setFocusEventId(eventId)
    }

    const win = window as Window & {
      ipcRenderer?: {
        on: (channel: string, listener: (...args: unknown[]) => void) => void
      }
    }
    if (win.ipcRenderer) {
      win.ipcRenderer.on('focus-event', handleFocusEvent)
    }
  }, [setIsGoogleConnected, setSettings, setManualEvents])

  const viewComponents = {
    today: <TodayView />,
    week: <WeekView />,
    settings: <SettingsView />,
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-[#FAF9F7]"
      style={{ opacity: settings.windowOpacity / 100 }}
    >
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {viewComponents[currentView]}
      </main>
      {focusEventId && <FocusMode />}
    </div>
  )
}
