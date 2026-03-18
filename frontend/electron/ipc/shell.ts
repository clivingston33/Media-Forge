import { app, ipcMain, shell } from 'electron'
import path from 'node:path'

export function registerShellHandlers() {
  ipcMain.handle('mediaforge:reveal-in-folder', async (_, filePath: string) => {
    if (!filePath) {
      return
    }

    await shell.showItemInFolder(filePath)
  })

  ipcMain.handle('mediaforge:open-logs-folder', async () => {
    const logsPath = path.join(app.getPath('userData'), 'logs')
    await shell.openPath(logsPath)
  })
}
