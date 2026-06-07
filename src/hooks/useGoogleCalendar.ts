import { useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import { useAppStore } from '../store/useAppStore'
import type { CalendarEvent } from '../types'

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Morning standup',
    start: dayjs().hour(9).minute(0).second(0).toDate(),
    end: dayjs().hour(9).minute(30).second(0).toDate(),
    isAllDay: false,
    calendarId: 'primary',
    calendarColor: '#4285F4',
    source: 'google',
    isDone: false,
  },
  {
    id: '2',
    title: 'Product review',
    description: 'Review Q3 roadmap with the team',
    start: dayjs().hour(11).minute(0).second(0).toDate(),
    end: dayjs().hour(12).minute(0).second(0).toDate(),
    isAllDay: false,
    calendarId: 'primary',
    calendarColor: '#4285F4',
    source: 'google',
    isDone: false,
  },
  {
    id: '3',
    title: 'CS Assignment — Binary Trees',
    description: 'Implement BST with insert, delete, search operations',
    start: dayjs().endOf('day').toDate(),
    end: dayjs().endOf('day').toDate(),
    isAllDay: true,
    calendarId: 'classroom',
    calendarColor: '#7C3AED',
    source: 'classroom',
    isDone: false,
  },
  {
    id: '4',
    title: 'Design review',
    start: dayjs().hour(14).minute(0).second(0).toDate(),
    end: dayjs().hour(15).minute(0).second(0).toDate(),
    isAllDay: false,
    calendarId: 'primary',
    calendarColor: '#0F9D58',
    source: 'google',
    isDone: false,
  },
  {
    id: '5',
    title: '1:1 with manager',
    start: dayjs().hour(16).minute(30).second(0).toDate(),
    end: dayjs().hour(17).minute(0).second(0).toDate(),
    isAllDay: false,
    calendarId: 'work',
    calendarColor: '#DB4437',
    source: 'google',
    isDone: false,
  },
]

export function useGoogleCalendar() {
  const { setEvents, setIsLoading, setIsOnline, setIsGoogleConnected } = useAppStore()

  const fetchEvents = useCallback(async (startDate: string, endDate: string) => {
    setIsLoading(true)
    try {
      const electronAPI = (window as Window & { electronAPI?: Record<string, (...args: unknown[]) => Promise<unknown>> }).electronAPI
      if (electronAPI) {
        const connected = await electronAPI.isGoogleConnected()
        setIsGoogleConnected(connected as boolean)
        if (connected) {
          const events = await electronAPI.getCalendarEvents(startDate, endDate)
          setEvents((events as Array<CalendarEvent & { start: string; end: string }>).map((e) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
          })))
          setIsOnline(true)
          setIsLoading(false)
          return
        }
      }
    } catch (_err) {
      setIsOnline(false)
    }
    // Fall back to mock data
    setEvents(MOCK_EVENTS)
    setIsLoading(false)
  }, [setEvents, setIsLoading, setIsOnline, setIsGoogleConnected])

  const fetchTodayEvents = useCallback(() => {
    const start = dayjs().startOf('day').toISOString()
    const end = dayjs().endOf('day').toISOString()
    fetchEvents(start, end)
  }, [fetchEvents])

  const fetchWeekEvents = useCallback((weekOffset: number) => {
    const start = dayjs().startOf('week').add(weekOffset, 'week').toISOString()
    const end = dayjs().endOf('week').add(weekOffset, 'week').toISOString()
    fetchEvents(start, end)
  }, [fetchEvents])

  useEffect(() => {
    fetchTodayEvents()
    const interval = setInterval(fetchTodayEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchTodayEvents])

  return { fetchTodayEvents, fetchWeekEvents, fetchEvents }
}
