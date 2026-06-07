import React, { useState } from 'react'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useAppStore } from '../store/useAppStore'
import type { CalendarEvent } from '../types'

dayjs.extend(weekOfYear)

export function WeekView() {
  const events = useAppStore((s) => s.events)
  const weekOffset = useAppStore((s) => s.selectedWeekOffset)
  const setWeekOffset = useAppStore((s) => s.setSelectedWeekOffset)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const startOfWeek = dayjs().startOf('week').add(weekOffset, 'week')
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'))

  const getEventsForDay = (day: dayjs.Dayjs) =>
    events.filter((e) => dayjs(e.start).isSame(day, 'day') || (e.isAllDay && dayjs(e.end).isSame(day, 'day')))

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#E8E4DC] flex items-center justify-between">
        <div>
          <div className="font-display text-2xl font-bold text-[#1A1714]">
            {startOfWeek.format('MMMM YYYY')}
          </div>
          <div className="text-xs text-[#7A7470] mt-0.5">Week {startOfWeek.week()}</div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7470] hover:bg-[#F4F2EE] transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-2 h-8 rounded-lg text-xs text-[#7A7470] hover:bg-[#F4F2EE] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7470] hover:bg-[#F4F2EE] transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Day columns */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 h-full min-h-0">
            {days.map((day) => {
              const isToday = day.isSame(dayjs(), 'day')
              const dayEvents = getEventsForDay(day)

              return (
                <div
                  key={day.toString()}
                  className={`border-r border-[#E8E4DC] last:border-r-0 min-h-0
                    ${isToday ? 'bg-[#FDF0E8]/30' : ''}
                  `}
                >
                  {/* Day header */}
                  <div className={`px-1 pt-2 pb-1 text-center border-b border-[#E8E4DC] sticky top-0 z-10
                    ${isToday ? 'bg-[#FDF0E8]/50' : 'bg-[#FAF9F7]'}
                  `}>
                    <div className="text-xs text-[#B0AAA4] font-medium">
                      {day.format('ddd')}
                    </div>
                    <div className={`text-base font-display font-semibold mt-0.5
                      ${isToday ? 'text-[#D4600A]' : 'text-[#1A1714]'}
                    `}>
                      {day.format('D')}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="px-1 py-1 space-y-0.5">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left px-1.5 py-1 rounded-md text-xs font-medium truncate transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: event.calendarColor + '22',
                          color: event.calendarColor,
                          borderLeft: `2px solid ${event.calendarColor}`,
                        }}
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Event detail panel */}
        {selectedEvent && (
          <div className="w-44 border-l border-[#E8E4DC] bg-white p-3 overflow-y-auto flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: selectedEvent.calendarColor }}
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#B0AAA4] hover:text-[#7A7470] text-sm leading-none"
              >
                ×
              </button>
            </div>
            <h3 className="font-medium text-sm text-[#1A1714] leading-snug mb-1">
              {selectedEvent.title}
            </h3>
            <p className="text-xs text-[#7A7470] mb-2">
              {selectedEvent.isAllDay
                ? 'All day'
                : `${dayjs(selectedEvent.start).format('h:mm A')} – ${dayjs(selectedEvent.end).format('h:mm A')}`}
            </p>
            {selectedEvent.description && (
              <p className="text-xs text-[#7A7470] mb-2">{selectedEvent.description}</p>
            )}
            {selectedEvent.source === 'classroom' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                Classroom
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
