import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

interface Props {
  date: Date
  isAllDay?: boolean
}

export function CountdownBadge({ date, isAllDay }: Props) {
  const [label, setLabel] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = dayjs()
      const target = dayjs(date)
      const diff = target.diff(now, 'minute')

      if (diff < 0) {
        setLabel('Overdue')
        setIsUrgent(false)
        return
      }

      setIsUrgent(diff <= 30)

      if (diff < 60) {
        setLabel(`In ${diff}m`)
      } else if (diff < 1440) {
        const h = Math.floor(diff / 60)
        const m = diff % 60
        setLabel(m > 0 ? `In ${h}h ${m}m` : `In ${h}h`)
      } else {
        const d = Math.floor(diff / 1440)
        setLabel(`In ${d}d`)
      }
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [date])

  if (isAllDay) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
        Due today
      </span>
    )
  }

  const bg = label === 'Overdue'
    ? 'bg-red-100 text-red-700'
    : isUrgent
    ? 'bg-orange-100 text-accent'
    : 'bg-gray-100 text-text-secondary'

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${bg} ${isUrgent ? 'animate-pulse-badge' : ''}`}
    >
      {label}
    </span>
  )
}
