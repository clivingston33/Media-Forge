import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const backendRoot = path.resolve(frontendRoot, '..', 'backend')
const stageRoot = path.join(frontendRoot, 'build', 'backend-runtime')

const runtimeEntries = [
  { path: 'app', required: true },
  { path: 'tools', required: false },
  { path: '.venv', required: true },
  { path: '.venv312', required: true },
  { path: 'start.py', required: true },
  { path: 'requirements.txt', required: true },
  { path: 'setup_real_tools.ps1', required: true },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function copyWithRetry(source, target, attempt = 1) {
  try {
    await fs.cp(source, target, {
      force: true,
      recursive: true,
    })
  } catch (error) {
    if ((error?.code === 'EBUSY' || error?.code === 'EPERM') && attempt < 6) {
      await delay(attempt * 750)
      await copyWithRetry(source, target, attempt + 1)
      return
    }

    throw error
  }
}

async function main() {
  await fs.rm(stageRoot, { recursive: true, force: true })
  await fs.mkdir(stageRoot, { recursive: true })

  for (const entry of runtimeEntries) {
    const source = path.join(backendRoot, entry.path)
    const target = path.join(stageRoot, entry.path)

    try {
      await fs.access(source)
    } catch {
      if (entry.required) {
        throw new Error(`Required backend runtime entry was not found: ${entry.path}`)
      }

      console.log(`Skipped missing optional entry ${entry.path}`)
      continue
    }

    await copyWithRetry(source, target)
    console.log(`Staged ${entry.path}`)
  }
}

await main()
