import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { useAppStore } from '../store/useAppStore'

export function FocusMode() {
  const focusEventId = useAppStore((s) => s.focusEventId)
  const events = useAppStore((s) => s.events)
  const setFocusEventId = useAppStore((s) => s.setFocusEventId)
  const markEventDone = useAppStore((s) => s.markEventDone)

  const [timeLeft, setTimeLeft] = useState('')
  const [visible, setVisible] = useState(false)

  const event = events.find((e) => e.id === focusEventId)

  useEffect(() => {
    if (focusEventId) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [focusEventId])

  useEffect(() => {
    if (!event) return

    const update = () => {
      const now = dayjs()
      const target = dayjs(event.isAllDay ? event.end : event.start)
      const diff = target.diff(now, 'second')

      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }

      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60

      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [event])

  if (!visible || !event) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF9F7]"
      style={{ animation: 'fadeIn 300ms ease' }}
    >
      <div className="max-w-sm w-full text-center px-8">
        {event.source === 'classroom' && (
          <span className="inline-block mb-4 text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
            Classroom
          </span>
        )}
        {event.source !== 'classroom' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: event.calendarColor }}
            />
            <span className="text-sm text-[#7A7470]">
              {event.isAllDay ? 'All day' : `${dayjs(event.start).format('h:mm A')} – ${dayjs(event.end).format('h:mm A')}`}
            </span>
          </div>
        )}

        <h1 className="font-display text-3xl font-bold text-[#1A1714] mb-2 leading-tight">
          {event.title}
        </h1>

        {event.description && (
          <p className="text-[#7A7470] text-sm mb-6">{event.description}</p>
        )}

        <div className="animate-breathing">
          <div className="text-5xl font-display font-semibold text-[#D4600A] tracking-widest my-8">
            {timeLeft}
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={() => {
              markEventDone(event.id)
              setFocusEventId(null)
            }}
            className="px-6 py-2.5 rounded-xl bg-[#2D7A4F] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Mark Done
          </button>
          <button
            onClick={() => setFocusEventId(null)}
            className="px-6 py-2.5 rounded-xl border border-[#E8E4DC] text-[#7A7470] font-medium hover:bg-[#F4F2EE] transition-colors"
          >
            Exit Focus
          </button>
        </div>
      </div>
    </div>
  )
}
