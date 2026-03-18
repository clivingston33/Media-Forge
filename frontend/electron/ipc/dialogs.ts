import { dialog, ipcMain } from 'electron'

export function registerDialogHandlers() {
  ipcMain.handle('mediaforge:pick-output-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Choose Output Folder',
    })

    return result.canceled ? null : result.filePaths[0] ?? null
  })
}
