import { app, ipcMain, shell } from 'electron'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

function resolveBackendRoot() {
  if (process.env.MEDIAFORGE_BACKEND_ROOT) {
    return process.env.MEDIAFORGE_BACKEND_ROOT
  }

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend')
  }

  return path.resolve(app.getAppPath(), '..', 'backend')
}

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

  ipcMain.handle('mediaforge:install-optional-tools', async () => {
    const backendRoot = resolveBackendRoot()
    const setupScriptPath = path.join(backendRoot, 'setup_real_tools.ps1')
    const toolsVenvRoot = path.join(app.getPath('userData'), 'backend-runtime', 'tools-runtime', '.venv312')
    const launcherScriptPath = path.join(app.getPath('userData'), 'install-optional-tools.ps1')

    if (!fs.existsSync(setupScriptPath)) {
      throw new Error(`Optional tool installer was not found at ${setupScriptPath}.`)
    }

    fs.mkdirSync(path.dirname(launcherScriptPath), { recursive: true })
    fs.writeFileSync(
      launcherScriptPath,
      [
        `$env:MEDIAFORGE_SKIP_API_SETUP = '1'`,
        `$env:MEDIAFORGE_SKIP_FFMPEG_BUNDLE = '1'`,
        `$env:MEDIAFORGE_TOOLS_VENV_ROOT = '${toolsVenvRoot.replace(/'/g, "''")}'`,
        `Set-Location '${backendRoot.replace(/'/g, "''")}'`,
        `Write-Host 'Installing optional MediaForge AI tools...' -ForegroundColor Cyan`,
        `& '${setupScriptPath.replace(/'/g, "''")}'`,
        `Write-Host ''`,
        `Write-Host 'Restart MediaForge or refresh System Health when installation completes.' -ForegroundColor Green`,
        `Read-Host 'Press Enter to close'`,
      ].join('\r\n'),
      'utf8',
    )

    const installer = spawn('powershell.exe', ['-NoLogo', '-ExecutionPolicy', 'Bypass', '-File', launcherScriptPath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    })
    installer.unref()
  })
}
