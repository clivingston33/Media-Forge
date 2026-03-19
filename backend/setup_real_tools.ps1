param(
    [switch]$SkipWinget,
    [switch]$SkipApiSetup,
    [switch]$SkipFfmpegBundle,
    [string]$ApiVenvRoot,
    [string]$ToolsVenvRoot,
    [string]$BundledFfmpegRoot
)

$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendRoot
$skipApiSetupRequested = $SkipApiSetup -or $env:MEDIAFORGE_SKIP_API_SETUP -eq "1"
$skipFfmpegBundleRequested = $SkipFfmpegBundle -or $env:MEDIAFORGE_SKIP_FFMPEG_BUNDLE -eq "1"

if (-not $ApiVenvRoot -and $env:MEDIAFORGE_API_VENV_ROOT) {
    $ApiVenvRoot = $env:MEDIAFORGE_API_VENV_ROOT
}

if (-not $ToolsVenvRoot -and $env:MEDIAFORGE_TOOLS_VENV_ROOT) {
    $ToolsVenvRoot = $env:MEDIAFORGE_TOOLS_VENV_ROOT
}

if (-not $BundledFfmpegRoot -and $env:MEDIAFORGE_BUNDLED_FFMPEG_ROOT) {
    $BundledFfmpegRoot = $env:MEDIAFORGE_BUNDLED_FFMPEG_ROOT
}

function Write-Step([string]$Message) {
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Get-Python312Path {
    if ($env:MEDIAFORGE_PYTHON312 -and (Test-Path $env:MEDIAFORGE_PYTHON312)) {
        return $env:MEDIAFORGE_PYTHON312
    }

    $launcher = Get-Command py -ErrorAction SilentlyContinue
    if ($launcher) {
        try {
            $pythonPath = & py -3.12 -c "import sys; print(sys.executable)" 2>$null
            if ($LASTEXITCODE -eq 0 -and $pythonPath) {
                return $pythonPath.Trim()
            }
        } catch {
        }
    }

    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand) {
        try {
            $pythonVersion = & $pythonCommand.Source -c "import sys; print(f'{sys.version_info[0]}.{sys.version_info[1]}')" 2>$null
            if ($LASTEXITCODE -eq 0 -and $pythonVersion.Trim() -eq "3.12") {
                return $pythonCommand.Source
            }
        } catch {
        }
    }

    return $null
}

function Find-WingetBinary([string]$FileName) {
    if (-not $env:LOCALAPPDATA) {
        return $null
    }

    $packagesRoot = Join-Path $env:LOCALAPPDATA "Microsoft\\WinGet\\Packages"
    if (-not (Test-Path $packagesRoot)) {
        return $null
    }

    $match = Get-ChildItem -Path $packagesRoot -Filter $FileName -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
    return $match.FullName
}

function Ensure-Venv([string]$PythonPath, [string]$VenvRoot, [string]$Label) {
    $venvPython = Join-Path $VenvRoot "Scripts\\python.exe"

    if (-not (Test-Path $venvPython)) {
        Write-Step "Creating $Label"
        & $PythonPath -m venv $VenvRoot
    }

    return $venvPython
}

function Ensure-WingetPackage([string]$Id, [string]$Label) {
    Write-Step "Installing $Label with winget"
    & winget install -e --id $Id --scope user --silent --accept-package-agreements --accept-source-agreements
}

$python312 = Get-Python312Path
if (-not $python312) {
    if ($SkipWinget) {
        throw "Python 3.12 is required. Install it manually or rerun without -SkipWinget."
    }

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "Python 3.12 is missing and winget is unavailable. Install Python 3.12 manually, then rerun this script."
    }

    Ensure-WingetPackage -Id "Python.Python.3.12" -Label "Python 3.12"
    $python312 = Get-Python312Path
}

if (-not $python312) {
    throw "Python 3.12 could not be located after installation."
}

$ffmpegExecutable = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
if (-not $ffmpegExecutable) {
    $ffmpegExecutable = Find-WingetBinary -FileName "ffmpeg.exe"
}

if (-not $ffmpegExecutable) {
    if ($SkipWinget) {
        throw "FFmpeg is required. Install it manually or rerun without -SkipWinget."
    }

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "FFmpeg is missing and winget is unavailable. Install FFmpeg manually, then rerun this script."
    }

    Ensure-WingetPackage -Id "Gyan.FFmpeg.Essentials" -Label "FFmpeg"
    $ffmpegExecutable = Find-WingetBinary -FileName "ffmpeg.exe"
}

if (-not $ffmpegExecutable) {
    throw "FFmpeg could not be located after installation."
}

$ffprobeExecutable = (Get-Command ffprobe -ErrorAction SilentlyContinue).Source
if (-not $ffprobeExecutable) {
    $ffprobeExecutable = Find-WingetBinary -FileName "ffprobe.exe"
}

if (-not $ffprobeExecutable) {
    $ffprobeExecutable = Join-Path (Split-Path -Parent $ffmpegExecutable) "ffprobe.exe"
}

if (-not (Test-Path $ffprobeExecutable)) {
    throw "FFprobe could not be located after installation."
}

$apiVenv = if ($ApiVenvRoot) { $ApiVenvRoot } else { Join-Path $backendRoot ".venv" }
if (-not $skipApiSetupRequested) {
    $apiPython = Ensure-Venv -PythonPath $python312 -VenvRoot $apiVenv -Label "$apiVenv for the FastAPI server"

    Write-Step "Upgrading pip in $apiVenv"
    & $apiPython -m pip install --upgrade pip

    Write-Step "Installing backend API packages"
    & $apiPython -m pip install -r (Join-Path $backendRoot "requirements.txt")
}

$toolsVenv = if ($ToolsVenvRoot) { $ToolsVenvRoot } else { Join-Path $backendRoot ".venv312" }
$toolPython = Ensure-Venv -PythonPath $python312 -VenvRoot $toolsVenv -Label "backend\\.venv312 for media tools"

Write-Step "Upgrading pip in $toolsVenv"
& $toolPython -m pip install --upgrade pip

$toolPackages = @(
    "demucs",
    "rembg[cpu]",
    "filetype",
    "watchdog",
    "pillow"
)

Write-Step "Installing media tool packages"
& $toolPython -m pip install @toolPackages

if (-not $skipFfmpegBundleRequested) {
    $bundledFfmpegRoot = if ($BundledFfmpegRoot) { $BundledFfmpegRoot } else { Join-Path $backendRoot "tools\\ffmpeg" }
    New-Item -ItemType Directory -Force -Path $bundledFfmpegRoot | Out-Null

    Write-Step "Bundling FFmpeg binaries into $bundledFfmpegRoot"
    Copy-Item -Force $ffmpegExecutable (Join-Path $bundledFfmpegRoot "ffmpeg.exe")
    Copy-Item -Force $ffprobeExecutable (Join-Path $bundledFfmpegRoot "ffprobe.exe")
}

Write-Step "Real media toolchain is ready"
if (-not $skipApiSetupRequested) {
    Write-Host "API Python: $apiPython"
}
Write-Host "Tool Python: $toolPython"
if (-not $skipFfmpegBundleRequested) {
    Write-Host "FFmpeg: $(Join-Path $bundledFfmpegRoot 'ffmpeg.exe')"
    Write-Host "FFprobe: $(Join-Path $bundledFfmpegRoot 'ffprobe.exe')"
}
Write-Host "If you install tools elsewhere, you can override discovery with MEDIAFORGE_TOOL_PYTHON and MEDIAFORGE_FFMPEG."
