import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getCalendarEvents: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('google:getEvents', startDate, endDate),

  getClassroomWork: () =>
    ipcRenderer.invoke('google:getClassroomWork'),

  connectGoogle: () =>
    ipcRenderer.invoke('google:connect'),

  disconnectGoogle: () =>
    ipcRenderer.invoke('google:disconnect'),

  isGoogleConnected: () =>
    ipcRenderer.invoke('google:isConnected'),

  getSettings: () =>
    ipcRenderer.invoke('settings:get'),

  saveSettings: (settings: unknown) =>
    ipcRenderer.invoke('settings:save', settings),

  setAlwaysOnTop: (value: boolean) =>
    ipcRenderer.send('window:setAlwaysOnTop', value),

  openFocusMode: (eventId: string) =>
    ipcRenderer.send('window:focusMode', eventId),

  scheduleReminder: (event: unknown, minutesBefore: number) =>
    ipcRenderer.send('reminder:schedule', event, minutesBefore),

  onFocusEvent: (callback: (eventId: string) => void) =>
    ipcRenderer.on('focus-event', (_event, eventId) => callback(eventId)),

  getManualEvents: () =>
    ipcRenderer.invoke('events:getManual'),

  saveManualEvent: (event: unknown) =>
    ipcRenderer.invoke('events:saveManual', event),

  deleteManualEvent: (id: string) =>
    ipcRenderer.invoke('events:deleteManual', id),
})
