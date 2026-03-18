import { ipcMain } from 'electron'
import type { DesktopRuntimeManager } from '../updater.js'

export function registerRuntimeHandlers(runtimeManager: DesktopRuntimeManager) {
  ipcMain.handle('mediaforge:get-runtime-state', async () => runtimeManager.getState())
  ipcMain.handle('mediaforge:check-for-updates', async () => runtimeManager.checkForUpdates())
  ipcMain.handle('mediaforge:quit-and-install-update', async () => {
    runtimeManager.quitAndInstall()
  })
}
