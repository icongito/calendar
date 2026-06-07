import React from 'react'
import { useAppStore } from '../store/useAppStore'

export function Sidebar() {
  const currentView = useAppStore((s) => s.currentView)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const isGoogleConnected = useAppStore((s) => s.isGoogleConnected)

  const navItems = [
    { id: 'today' as const, label: 'Today', icon: '◉' },
    { id: 'week' as const, label: 'Week', icon: '▦' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙' },
  ]

  return (
    <div className="w-16 flex flex-col items-center py-4 border-r border-[#E8E4DC] bg-[#FAF9F7] h-full">
      <div className="w-8 h-8 rounded-lg bg-[#D4600A] flex items-center justify-center mb-6">
        <span className="text-white text-xs font-display font-bold">FC</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            title={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all
              ${currentView === item.id
                ? 'bg-[#FDF0E8] text-[#D4600A]'
                : 'text-[#B0AAA4] hover:bg-[#F4F2EE] hover:text-[#7A7470]'
              }`}
          >
            {item.icon}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div
          className={`w-2 h-2 rounded-full mx-auto ${isGoogleConnected ? 'bg-[#2D7A4F]' : 'bg-[#B0AAA4]'}`}
          title={isGoogleConnected ? 'Connected' : 'Not connected'}
        />
      </div>
    </div>
  )
}
