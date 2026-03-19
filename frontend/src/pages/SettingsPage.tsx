import { GeneralSettingsCard } from '../components/settings/GeneralSettingsCard'
import { ResourceCard } from '../components/settings/ResourceCard'
import { useElectronDialog } from '../hooks/useElectronDialog'
import { useDesktopRuntimeStore } from '../store/desktopRuntimeStore'
import { useSettingsStore } from '../store/settingsStore'

export function SettingsPage() {
  const settings = useSettingsStore((state) => ({
    gpu_acceleration: state.gpu_acceleration,
    output_folder: state.output_folder,
    queue_concurrency: state.queue_concurrency,
    temp_cache_gb: state.temp_cache_gb,
    auto_save_exports: state.auto_save_exports,
  }))
  const save = useSettingsStore((state) => state.save)
  const runtime = useDesktopRuntimeStore((state) => state.runtime)
  const runtimeLoading = useDesktopRuntimeStore((state) => state.loading)
  const runtimeError = useDesktopRuntimeStore((state) => state.error)
  const checkForUpdates = useDesktopRuntimeStore((state) => state.checkForUpdates)
  const quitAndInstallUpdate = useDesktopRuntimeStore((state) => state.quitAndInstallUpdate)
  const { installOptionalTools, openLogsFolder, pickOutputFolder } = useElectronDialog()

  async function handlePickFolder() {
    const pickedFolder = await pickOutputFolder()

    if (pickedFolder) {
      await save({ output_folder: pickedFolder })
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
      <GeneralSettingsCard
        onConcurrencyChange={(value) => void save({ queue_concurrency: value })}
        onPickFolder={() => void handlePickFolder()}
        onToggle={(key) => void save({ [key]: !settings[key] })}
        settings={settings}
      />
      <ResourceCard
        onCheckForUpdates={() => void checkForUpdates()}
        onInstallUpdate={() => void quitAndInstallUpdate()}
        onInstallOptionalTools={() => void installOptionalTools()}
        onOpenLogs={() => void openLogsFolder()}
        runtime={runtime}
        runtimeError={runtimeError}
        runtimeLoading={runtimeLoading}
        settings={settings}
      />
    </section>
  )
}
