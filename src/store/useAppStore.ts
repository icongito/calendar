import { create } from 'zustand'
import type { CalendarEvent, AppSettings, ManualEvent } from '../types'

type View = 'today' | 'week' | 'settings'

interface AppStore {
  currentView: View
  setCurrentView: (view: View) => void

  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void

  manualEvents: ManualEvent[]
  setManualEvents: (events: ManualEvent[]) => void
  addOrUpdateManualEvent: (event: ManualEvent) => void
  deleteManualEvent: (id: string) => void

  focusEventId: string | null
  setFocusEventId: (id: string | null) => void

  settings: AppSettings
  setSettings: (settings: Partial<AppSettings>) => void

  isOnline: boolean
  setIsOnline: (online: boolean) => void

  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  isGoogleConnected: boolean
  setIsGoogleConnected: (connected: boolean) => void

  selectedWeekOffset: number
  setSelectedWeekOffset: (offset: number) => void

  markEventDone: (eventId: string) => void
}

const defaultSettings: AppSettings = {
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
}

export const useAppStore = create<AppStore>((set) => ({
  currentView: 'today',
  setCurrentView: (view) => set({ currentView: view }),

  events: [],
  setEvents: (events) => set({ events }),

  manualEvents: [],
  setManualEvents: (manualEvents) => set({ manualEvents }),
  addOrUpdateManualEvent: (event) =>
    set((state) => {
      const idx = state.manualEvents.findIndex((e) => e.id === event.id)
      if (idx >= 0) {
        const updated = [...state.manualEvents]
        updated[idx] = event
        return { manualEvents: updated }
      }
      return { manualEvents: [...state.manualEvents, event] }
    }),
  deleteManualEvent: (id) =>
    set((state) => ({ manualEvents: state.manualEvents.filter((e) => e.id !== id) })),

  focusEventId: null,
  setFocusEventId: (id) => set({ focusEventId: id }),

  settings: defaultSettings,
  setSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  isOnline: true,
  setIsOnline: (online) => set({ isOnline: online }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  isGoogleConnected: false,
  setIsGoogleConnected: (connected) => set({ isGoogleConnected: connected }),

  selectedWeekOffset: 0,
  setSelectedWeekOffset: (offset) => set({ selectedWeekOffset: offset }),

  markEventDone: (eventId) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, isDone: true } : e
      ),
    })),
}))
