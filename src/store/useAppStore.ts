import { create } from 'zustand'
import type { CalendarEvent, AppSettings } from '../types'

type View = 'today' | 'week' | 'settings'

interface AppStore {
  currentView: View
  setCurrentView: (view: View) => void

  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void

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
