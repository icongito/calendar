import React from 'react'
import dayjs from 'dayjs'
import { CountdownBadge } from './CountdownBadge'
import { useAppStore } from '../store/useAppStore'
import type { CalendarEvent } from '../types'

interface Props {
  event: CalendarEvent
  index?: number
  compact?: boolean
}

export function TaskCard({ event, index = 0, compact = false }: Props) {
  const setFocusEventId = useAppStore((s) => s.setFocusEventId)
  const markEventDone = useAppStore((s) => s.markEventDone)

  const timeLabel = event.isAllDay
    ? 'All day'
    : `${dayjs(event.start).format('h:mm A')} – ${dayjs(event.end).format('h:mm A')}`

  const animationDelay = `${index * 40}ms`

  return (
    <div
      className={`bg-white rounded-[12px] shadow-card border border-[#E8E4DC] transition-all duration-150
        hover:bg-[#F4F2EE] cursor-pointer animate-slide-in
        ${event.isDone ? 'opacity-50 task-done' : ''}
        ${compact ? 'p-2' : 'p-4'}
      `}
      style={{ animationDelay }}
      onClick={() => !event.isDone && setFocusEventId(event.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.calendarColor }}
            />
            {event.source === 'classroom' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                Classroom
              </span>
            )}
          </div>
          <h3
            className={`task-title font-medium text-[#1A1714] leading-tight ${compact ? 'text-sm' : 'text-base'}`}
          >
            {event.title}
          </h3>
          <p className="text-xs text-[#7A7470] mt-0.5">{timeLabel}</p>
          {event.description && !compact && (
            <p className="text-sm text-[#7A7470] mt-1 line-clamp-2">{event.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <CountdownBadge date={event.isAllDay ? event.end : event.start} isAllDay={event.isAllDay} />
          {!event.isDone && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                markEventDone(event.id)
              }}
              className="text-xs px-2 py-1 rounded-lg bg-[#F4F2EE] text-[#7A7470] font-medium hover:bg-[#E8E4DC] transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
