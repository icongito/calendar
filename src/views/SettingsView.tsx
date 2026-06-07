import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export function SettingsView() {
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const isGoogleConnected = useAppStore((s) => s.isGoogleConnected)
  const setIsGoogleConnected = useAppStore((s) => s.setIsGoogleConnected)
  const [isConnecting, setIsConnecting] = useState(false)

  const electronAPI = (window as Window & {
    electronAPI?: {
      connectGoogle: () => Promise<{ email: string; avatar: string }>
      disconnectGoogle: () => Promise<void>
      setAlwaysOnTop: (value: boolean) => void
      saveSettings: (settings: unknown) => Promise<void>
    }
  }).electronAPI

  const handleConnect = async () => {
    if (!electronAPI) return
    setIsConnecting(true)
    try {
      const result = await electronAPI.connectGoogle()
      setIsGoogleConnected(true)
      setSettings({ connectedEmail: result.email, connectedAvatar: result.avatar })
    } catch {
      // user cancelled
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!electronAPI) return
    await electronAPI.disconnectGoogle()
    setIsGoogleConnected(false)
    setSettings({ connectedEmail: undefined, connectedAvatar: undefined })
  }

  const handleAlwaysOnTop = (value: boolean) => {
    setSettings({ alwaysOnTop: value })
    electronAPI?.setAlwaysOnTop(value)
  }

  const handleSaveSettings = async () => {
    electronAPI?.saveSettings(settings)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-[#E8E4DC]">
        <div className="font-display text-2xl font-bold text-[#1A1714]">Settings</div>
        <div className="text-sm text-[#7A7470] mt-0.5">Preferences & integrations</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Google Account */}
        <section>
          <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-3">
            Google Account
          </h2>
          <div className="bg-white rounded-[12px] shadow-card border border-[#E8E4DC] p-4">
            {isGoogleConnected && settings.connectedEmail ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.connectedAvatar ? (
                    <img
                      src={settings.connectedAvatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#FDF0E8] flex items-center justify-center text-[#D4600A] font-bold text-sm">
                      {settings.connectedEmail[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-[#1A1714]">{settings.connectedEmail}</div>
                    <div className="text-xs text-[#2D7A4F]">Connected</div>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-[#B03A2E] hover:underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-2.5 rounded-xl bg-[#D4600A] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isConnecting ? 'Connecting…' : 'Connect Google Account'}
              </button>
            )}
          </div>
        </section>

        {/* Classroom */}
        <section>
          <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-3">
            Google Classroom
          </h2>
          <div className="bg-white rounded-[12px] shadow-card border border-[#E8E4DC] p-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#1A1714]">Enable Classroom</div>
                <div className="text-xs text-[#7A7470]">Show assignments from Google Classroom</div>
              </div>
              <input
                type="checkbox"
                checked={settings.classroomEnabled}
                onChange={(e) => setSettings({ classroomEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#D4600A]"
              />
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-3">
            Reminders
          </h2>
          <div className="bg-white rounded-[12px] shadow-card border border-[#E8E4DC] divide-y divide-[#E8E4DC]">
            {[
              { key: 'oneDay', label: '1 day before', desc: 'For all-day events' },
              { key: 'twoHours', label: '2 hours before', desc: '' },
              { key: 'thirtyMinutes', label: '30 minutes before', desc: '' },
              { key: 'fiveMinutes', label: '5 minutes before', desc: '' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-4 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-[#1A1714]">{label}</div>
                  {desc && <div className="text-xs text-[#7A7470]">{desc}</div>}
                </div>
                <input
                  type="checkbox"
                  checked={settings.reminderIntervals[key as keyof typeof settings.reminderIntervals]}
                  onChange={(e) =>
                    setSettings({
                      reminderIntervals: {
                        ...settings.reminderIntervals,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#D4600A]"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Window */}
        <section>
          <h2 className="text-xs font-semibold text-[#B0AAA4] uppercase tracking-widest mb-3">
            Window
          </h2>
          <div className="bg-white rounded-[12px] shadow-card border border-[#E8E4DC] divide-y divide-[#E8E4DC]">
            <label className="flex items-center justify-between p-4 cursor-pointer">
              <div>
                <div className="text-sm font-medium text-[#1A1714]">Always on top</div>
                <div className="text-xs text-[#7A7470]">Float above other windows</div>
              </div>
              <input
                type="checkbox"
                checked={settings.alwaysOnTop}
                onChange={(e) => handleAlwaysOnTop(e.target.checked)}
                className="w-4 h-4 accent-[#D4600A]"
              />
            </label>
            <label className="flex items-center justify-between p-4 cursor-pointer">
              <div>
                <div className="text-sm font-medium text-[#1A1714]">Launch at login</div>
                <div className="text-xs text-[#7A7470]">Start automatically on macOS login</div>
              </div>
              <input
                type="checkbox"
                checked={settings.launchAtLogin}
                onChange={(e) => {
                  setSettings({ launchAtLogin: e.target.checked })
                  electronAPI?.saveSettings({ launchAtLogin: e.target.checked })
                }}
                className="w-4 h-4 accent-[#D4600A]"
              />
            </label>
            <div className="p-4">
              <div className="text-sm font-medium text-[#1A1714] mb-2">
                Window opacity: {settings.windowOpacity}%
              </div>
              <input
                type="range"
                min="90"
                max="100"
                value={settings.windowOpacity}
                onChange={(e) => setSettings({ windowOpacity: Number(e.target.value) })}
                className="w-full accent-[#D4600A]"
              />
            </div>
          </div>
        </section>

        <button
          onClick={handleSaveSettings}
          className="w-full py-2.5 rounded-xl bg-[#D4600A] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
