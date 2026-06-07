import React, { useState, useRef, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import type { ManualEvent } from '../types'
import { useAppStore } from '../store/useAppStore'

const COLOR_SWATCHES = [
  '#4285F4',
  '#D4600A',
  '#0F9D58',
  '#DB4437',
  '#7C3AED',
  '#C4900A',
]

interface Props {
  onClose: () => void
  defaultDate?: Date
}

export function AddEventModal({ onClose, defaultDate }: Props) {
  const addOrUpdateManualEvent = useAppStore((s) => s.addOrUpdateManualEvent)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(dayjs(defaultDate ?? new Date()).format('YYYY-MM-DD'))
  const [isAllDay, setIsAllDay] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#D4600A')
  const [imageData, setImageData] = useState<string | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const [titleError, setTitleError] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageData(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleImageFile(file)
    },
    [handleImageFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageFile(file)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }

    const startDate = isAllDay
      ? dayjs(date).startOf('day').toDate()
      : dayjs(`${date}T${startTime}`).toDate()
    const endDate = isAllDay
      ? dayjs(date).endOf('day').toDate()
      : dayjs(`${date}T${endTime}`).toDate()

    const event: ManualEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      start: startDate,
      end: endDate,
      isAllDay,
      calendarId: 'manual',
      calendarColor: color,
      source: 'manual',
      isDone: false,
      imageData,
      isManual: true,
    }

    const electronAPI = (window as Window & {
      electronAPI?: { saveManualEvent: (e: unknown) => Promise<void> }
    }).electronAPI

    if (electronAPI?.saveManualEvent) {
      electronAPI.saveManualEvent(event).catch(console.error)
    }

    addOrUpdateManualEvent(event)
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, date, isAllDay, startTime, endTime, description, color, imageData])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      style={{ animation: 'fadeIn 300ms ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[#FAF9F7] rounded-[12px] border border-[#E8E4DC] shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E8E4DC] flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-[#1A1714]">Add Event</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#B0AAA4] hover:text-[#7A7470] hover:bg-[#F4F2EE] transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
              Title <span className="text-[#DB4437]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="Event title"
              autoFocus
              className={`w-full px-3 py-2 rounded-lg border text-[#1A1714] text-sm bg-white placeholder-[#B0AAA4] outline-none focus:ring-2 focus:ring-[#D4600A]/30 transition-all
                ${titleError ? 'border-[#DB4437]' : 'border-[#E8E4DC]'}
              `}
            />
            {titleError && (
              <p className="text-xs text-[#DB4437] mt-1">Title is required</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E4DC] text-[#1A1714] text-sm bg-white outline-none focus:ring-2 focus:ring-[#D4600A]/30 transition-all"
            />
          </div>

          {/* All day toggle + time inputs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIsAllDay(!isAllDay)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
                  ${isAllDay ? 'bg-[#D4600A]' : 'bg-[#E8E4DC]'}
                `}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
                    ${isAllDay ? 'left-4' : 'left-0.5'}
                  `}
                />
              </button>
              <span className="text-sm text-[#7A7470]">All day</span>
            </div>
            {!isAllDay && (
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
                    Start
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E4DC] text-[#1A1714] text-sm bg-white outline-none focus:ring-2 focus:ring-[#D4600A]/30 transition-all"
                  />
                </div>
                <div className="mt-5 text-[#B0AAA4] text-sm">–</div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
                    End
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E4DC] text-[#1A1714] text-sm bg-white outline-none focus:ring-2 focus:ring-[#D4600A]/30 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E4DC] text-[#1A1714] text-sm bg-white placeholder-[#B0AAA4] outline-none focus:ring-2 focus:ring-[#D4600A]/30 transition-all resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
              Color
            </label>
            <div className="flex gap-2">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#1A1714' : 'transparent',
                    boxShadow: color === c ? `0 0 0 2px #FAF9F7, 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-[#7A7470] uppercase tracking-wide mb-1.5">
              Image
            </label>
            {imageData ? (
              <div className="relative inline-block">
                <img
                  src={imageData}
                  alt="Preview"
                  className="w-full max-h-40 object-cover rounded-lg border border-[#E8E4DC]"
                />
                <button
                  type="button"
                  onClick={() => setImageData(undefined)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-[#D4600A] bg-[#FDF0E8]' : 'border-[#E8E4DC] hover:border-[#D4600A]/50 hover:bg-[#F4F2EE]'}
                `}
              >
                <div className="text-2xl mb-2">🖼</div>
                <p className="text-sm text-[#7A7470]">
                  Drop a screenshot or click to browse
                </p>
                <p className="text-xs text-[#B0AAA4] mt-1">PNG, JPG, GIF supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E4DC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#E8E4DC] text-[#7A7470] text-sm font-medium hover:bg-[#F4F2EE] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: color }}
          >
            Add Event
          </button>
        </div>
      </div>
    </div>
  )
}
