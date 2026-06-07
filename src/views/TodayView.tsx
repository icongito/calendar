import React, { useState } from 'react'
import dayjs from 'dayjs'
import { useAppStore } from '../store/useAppStore'
import { TaskCard } from '../components/TaskCard'
import { AddEventModal } from '../components/AddEventModal'

export function TodayView() {
  const events = useAppStore((s) => s.events)
  const manualEvents = useAppStore((s) => s.manualEvents)
  const isOnline = useAppStore((s) => s.isOnline)
  const isLoading = useAppStore((s) => s.isLoading)
  const [showAddModal, setShowAddModal] = useState(false)

  const allEvents = [...events, ...manualEvents]

  const todayEvents = allEvents
    .filter((e) => dayjs(e.start).isSame(dayjs(), 'day') || (e.isAllDay && dayjs(e.end).isSame(dayjs(), 'day')))
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())

  const pendingEvents = todayEvents.filter((e) => !e.isDone)
  const doneEvents = todayEvents.filter((e) => e.isDone)

  const now = dayjs()
  const focusEvents = [...pendingEvents]
    .sort((a, b) => {
      const aUrgency = dayjs(a.isAllDay ? a.end : a.start).diff(now, 'minute')
      const bUrgency = dayjs(b.isAllDay ? b.end : b.start).diff(now, 'minute')
      return aUrgency - bUrgency
    })
    .slice(0, 3)

  const timelineEvents = pendingEvents.filter((e) => !focusEvents.find((f) => f.id === e.id))

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#E8E4DC]">
        {!isOnline && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            Offline — showing cached data
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-3xl font-bold text-[#1A1714] leading-tight">
              {dayjs().format('MMMM D')}
            </div>
            <div className="text-sm text-[#7A7470] mt-0.5">
              {dayjs().format('dddd')} · {pendingEvents.length} task{pendingEvents.length !== 1 ? 's' : ''} today
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-1 w-8 h-8 rounded-full bg-[#D4600A] text-white flex items-center justify-center text-xl font-light hover:bg-[#B84F08] transition-colors shadow-sm flex-shrink-0"
            title="Add event"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Focus section */}
        {focusEvents.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-2 px-1">
              Your Focus
            </h2>
            <div className="space-y-2">
              {focusEvents.map((event, i) => (
                <TaskCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {timelineEvents.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-2 px-1">
              Timeline
            </h2>
            <div className="space-y-2">
              {timelineEvents.map((event, i) => (
                <TaskCard key={event.id} event={event} index={i + focusEvents.length} compact />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {doneEvents.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-2 px-1">
              Completed
            </h2>
            <div className="space-y-2">
              {doneEvents.map((event, i) => (
                <TaskCard key={event.id} event={event} index={i} compact />
              ))}
            </div>
          </section>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#D4600A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && todayEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="font-display text-lg text-[#1A1714]">Clear day ahead</p>
            <p className="text-sm text-[#7A7470] mt-1">No events scheduled for today</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddEventModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
