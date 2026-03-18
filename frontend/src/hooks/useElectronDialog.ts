export function useElectronDialog() {
  return {
    pickOutputFolder: async () => window.mediaForge?.pickOutputFolder() ?? null,
    revealInFolder: async (path: string) => {
      if (!window.mediaForge) {
        return
      }

      await window.mediaForge.revealInFolder(path)
    },
    openLogsFolder: async () => {
      if (!window.mediaForge) {
        return
      }

      await window.mediaForge.openLogsFolder()
    },
  }
}
