import { useEffect } from 'react'
import { useDesktopRuntimeStore } from '../store/desktopRuntimeStore'

export function useDesktopRuntime() {
  const hydrate = useDesktopRuntimeStore((state) => state.hydrate)
  const setRuntime = useDesktopRuntimeStore((state) => state.setRuntime)

  useEffect(() => {
    void hydrate()

    if (!window.mediaForge) {
      return
    }

    return window.mediaForge.onRuntimeStateChange((runtime) => {
      setRuntime(runtime)
    })
  }, [hydrate, setRuntime])
}
