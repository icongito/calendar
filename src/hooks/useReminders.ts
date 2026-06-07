import { useEffect } from 'react'
import dayjs from 'dayjs'
import { useAppStore } from '../store/useAppStore'

export function useReminders() {
  const { events, settings } = useAppStore()

  useEffect(() => {
    const electronAPI = (window as Window & { electronAPI?: Record<string, (...args: unknown[]) => unknown> }).electronAPI
    if (!electronAPI) return

    events.forEach((event) => {
      if (event.isDone) return
      const now = dayjs()
      const eventStart = dayjs(event.start)

      if (settings.reminderIntervals.fiveMinutes) {
        const fiveMinBefore = eventStart.subtract(5, 'minute')
        if (fiveMinBefore.isAfter(now)) {
          electronAPI.scheduleReminder(event, 5)
        }
      }
      if (settings.reminderIntervals.thirtyMinutes) {
        const thirtyMinBefore = eventStart.subtract(30, 'minute')
        if (thirtyMinBefore.isAfter(now)) {
          electronAPI.scheduleReminder(event, 30)
        }
      }
      if (settings.reminderIntervals.twoHours) {
        const twoHoursBefore = eventStart.subtract(2, 'hour')
        if (twoHoursBefore.isAfter(now)) {
          electronAPI.scheduleReminder(event, 120)
        }
      }
      if (settings.reminderIntervals.oneDay && event.isAllDay) {
        const oneDayBefore = eventStart.subtract(1, 'day')
        if (oneDayBefore.isAfter(now)) {
          electronAPI.scheduleReminder(event, 1440)
        }
      }
    })
  }, [events, settings.reminderIntervals])
}
