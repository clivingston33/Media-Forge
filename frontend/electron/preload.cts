require('@sentry/electron/preload')

const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron')

contextBridge.exposeInMainWorld('mediaForge', {
  pickOutputFolder: () => ipcRenderer.invoke('mediaforge:pick-output-folder'),
  revealInFolder: (path: string) => ipcRenderer.invoke('mediaforge:reveal-in-folder', path),
  openLogsFolder: () => ipcRenderer.invoke('mediaforge:open-logs-folder'),
  installOptionalTools: () => ipcRenderer.invoke('mediaforge:install-optional-tools'),
  getRuntimeState: () => ipcRenderer.invoke('mediaforge:get-runtime-state'),
  checkForUpdates: () => ipcRenderer.invoke('mediaforge:check-for-updates'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('mediaforge:quit-and-install-update'),
  onRuntimeStateChange: (callback: (state: unknown) => void) => {
    const listener = (_event: unknown, state: unknown) => callback(state)
    ipcRenderer.on('mediaforge:runtime-state-changed', listener)
    return () => ipcRenderer.removeListener('mediaforge:runtime-state-changed', listener)
  },
})
