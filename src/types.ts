export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  isAllDay: boolean
  calendarId: string
  calendarColor: string
  source: 'google' | 'classroom'
  htmlLink?: string
  location?: string
  isDone: boolean
}

export interface ClassroomAssignment {
  id: string
  courseId: string
  courseName: string
  title: string
  dueDate?: Date
  maxPoints?: number
  link: string
}

export interface AppSettings {
  connectedEmail?: string
  connectedAvatar?: string
  enabledCalendarIds: string[]
  classroomEnabled: boolean
  reminderIntervals: {
    oneDay: boolean
    twoHours: boolean
    thirtyMinutes: boolean
    fiveMinutes: boolean
  }
  launchAtLogin: boolean
  alwaysOnTop: boolean
  windowOpacity: number
}

export interface GoogleCalendarInfo {
  id: string
  summary: string
  backgroundColor: string
  foregroundColor: string
  selected: boolean
}
