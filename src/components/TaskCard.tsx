import React, { useState } from 'react'
import dayjs from 'dayjs'
import { CountdownBadge } from './CountdownBadge'
import { useAppStore } from '../store/useAppStore'
import type { CalendarEvent, ManualEvent } from '../types'

interface Props {
  event: CalendarEvent
  index?: number
  compact?: boolean
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      onClick={onClose}
      style={{ animation: 'fadeIn 200ms ease' }}
    >
      <img
        src={src}
        alt="Event attachment"
        className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

export function TaskCard({ event, index = 0, compact = false }: Props) {
  const setFocusEventId = useAppStore((s) => s.setFocusEventId)
  const markEventDone = useAppStore((s) => s.markEventDone)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const timeLabel = event.isAllDay
    ? 'All day'
    : `${dayjs(event.start).format('h:mm A')} – ${dayjs(event.end).format('h:mm A')}`

  const animationDelay = `${index * 40}ms`
  const imageData = (event as ManualEvent).imageData

  return (
    <>
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
            {imageData && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxOpen(true)
                }}
                className="w-12 h-12 rounded-lg overflow-hidden border border-[#E8E4DC] hover:border-[#D4600A] transition-colors flex-shrink-0"
                title="View image"
              >
                <img src={imageData} alt="Attachment" className="w-full h-full object-cover" />
              </button>
            )}
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
      {lightboxOpen && imageData && (
        <ImageLightbox src={imageData} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}
