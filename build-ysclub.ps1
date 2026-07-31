# YSCLUB Windows Build Script
# Run this script in a PowerShell window (as Administrator) OUTSIDE of TRAE
# Right-click the file -> "Run with PowerShell" (Run as Administrator)
#
# Usage:
#   1. Open PowerShell as Administrator (outside TRAE)
#   2. cd C:\Users\Administrator\Desktop\clash-verge-rev-dev
#   3. .\build-ysclub.ps1
#   Or simply right-click this file and select "Run with PowerShell"

$ErrorActionPreference = "Stop"
$ProjectPath = "C:\Users\Administrator\Desktop\clash-verge-rev-dev"

function Write-Step($msg) { Write-Host "`n========== $msg ==========" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# ============ Step 0: Check Admin ============
Write-Step "Step 0: Check Administrator privileges"
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Err "Please run this script as Administrator!"
    Write-Host "Right-click PowerShell -> 'Run as Administrator' -> then run this script."
    exit 1
}
Write-OK "Running as Administrator"

# ============ Step 1: Handle proxy ============
Write-Step "Step 1: Check proxy settings"
# Check if proxy is running (Clash/mihomo at 127.0.0.1:7897)
$proxyRunning = $false
try {
    $tcpTest = Test-NetConnection -ComputerName 127.0.0.1 -Port 7897 -WarningAction SilentlyContinue
    $proxyRunning = $tcpTest.TcpTestSucceeded
} catch { }

if ($proxyRunning) {
    Write-OK "Proxy is running at 127.0.0.1:7897, keeping proxy settings"
} else {
    Write-Warn "Proxy at 127.0.0.1:7897 is not running. Clearing proxy for this session only."
    Write-Host "  (Your user-level proxy settings will be preserved)"
    # Only clear session-level, NOT user-level
    $env:HTTP_PROXY = $null
    $env:HTTPS_PROXY = $null
    $env:http_proxy = $null
    $env:https_proxy = $null
}

# ============ Step 2: Install VS C++ Build Tools ============
Write-Step "Step 2: Check/install Visual Studio C++ Build Tools"
$vswhere = "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe"
$hasVcTools = & $vswhere -all -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null

if ($hasVcTools) {
    Write-OK "VC++ Tools already installed at: $hasVcTools"
} else {
    Write-Host "VC++ Tools not found. Installing Visual Studio C++ Build Tools..."
    
    # Check if VS Community 2026 is installed
    $vsPath = & $vswhere -all -products * -property installationPath 2>$null | Select-Object -First 1
    
    if ($vsPath) {
        Write-Host "Found existing Visual Studio at: $vsPath"
        Write-Host "Adding C++ workload..."
        $setupExe = "C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe"
        & $setupExe modify --installPath $vsPath --add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended --passive --wait
    } else {
        Write-Host "No Visual Studio found. Downloading and installing Build Tools..."
        $bootstrapper = "$env:TEMP\vs_BuildTools.exe"
        Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vs_BuildTools.exe" -OutFile $bootstrapper -UseBasicParsing
        & $bootstrapper --passive --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended
    }
    
    # Verify installation
    Start-Sleep -Seconds 5
    $hasVcTools = & $vswhere -all -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null
    if ($hasVcTools) {
        Write-OK "VC++ Tools installed successfully at: $hasVcTools"
    } else {
        Write-Err "VC++ Tools installation may have failed."
        Write-Host "Please open Visual Studio Installer manually and add the 'Desktop development with C++' workload."
        Write-Host "Then re-run this script."
        exit 1
    }
}

# ============ Step 3: Install NSIS ============
Write-Step "Step 3: Check/install NSIS"
$nsisPath = $null
$possiblePaths = @(
    "C:\Program Files (x86)\NSIS\makensis.exe",
    "C:\Program Files\NSIS\makensis.exe"
)

foreach ($p in $possiblePaths) {
    if (Test-Path $p) {
        $nsisPath = $p
        break
    }
}

if (-not $nsisPath) {
    $makensis = Get-Command makensis -ErrorAction SilentlyContinue
    if ($makensis) { $nsisPath = $makensis.Source }
}

if ($nsisPath) {
    Write-OK "NSIS found at: $nsisPath"
} else {
    Write-Host "NSIS not found. Installing via Chocolatey..."
    $choco = Get-Command choco -ErrorAction SilentlyContinue
    if ($choco) {
        choco install nsis -y --no-progress
    } else {
        Write-Host "Chocolatey not found. Downloading NSIS directly..."
        $nsisZip = "$env:TEMP\nsis-3.10.zip"
        $nsisDir = "C:\Program Files (x86)\NSIS"
        Invoke-WebRequest -Uri "https://prdownloads.sourceforge.net/nsis/nsis-3.10.zip" -OutFile $nsisZip -UseBasicParsing
        Expand-Archive -Path $nsisZip -DestinationPath $nsisDir -Force
        $nsisPath = "$nsisDir\makensis.exe"
    }
    
    if (Test-Path $nsisPath) {
        Write-OK "NSIS installed at: $nsisPath"
    } else {
        Write-Warn "NSIS installation may have failed. Tauri may download it automatically during build."
    }
}

# ============ Step 4: Verify Rust ============
Write-Step "Step 4: Verify Rust toolchain"
$rustc = Get-Command rustc -ErrorAction SilentlyContinue
if ($rustc) {
    $rustVersion = rustc --version 2>&1
    Write-OK "Rust found: $rustVersion"
} else {
    Write-Err "Rust not found! Please install Rust from https://rustup.rs"
    exit 1
}

$rustup = Get-Command rustup -ErrorAction SilentlyContinue
if ($rustup) {
    $targets = rustup target list --installed 2>&1
    Write-Host "Installed Rust targets:"
    Write-Host $targets
}

# ============ Step 5: Verify Node.js and pnpm ============
Write-Step "Step 5: Verify Node.js and pnpm"
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-OK "Node.js: $(node --version)"
} else {
    Write-Err "Node.js not found! Please install Node.js from https://nodejs.org"
    exit 1
}

$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpm) {
    Write-OK "pnpm: $(pnpm --version)"
} else {
    Write-Host "pnpm not found. Installing..."
    npm install -g pnpm
}

# ============ Step 6: Navigate to project ============
Write-Step "Step 6: Navigate to project directory"
Set-Location $ProjectPath
Write-OK "Working directory: $(Get-Location)"

# ============ Step 7: Install dependencies ============
Write-Step "Step 7: Install npm dependencies"
if (Test-Path "node_modules") {
    Write-Host "node_modules already exists. Running pnpm install to ensure completeness..."
} else {
    Write-Host "Installing dependencies..."
}
pnpm install --legacy-peer-deps 2>&1 | Write-Host
Write-OK "Dependencies installed"

# ============ Step 8: Run prebuild ============
Write-Step "Step 8: Download mihomo core and resources (prebuild)"
if ((Test-Path "src-tauri\sidecar\verge-mihomo-x86_64-pc-windows-msvc.exe") -and 
    (Test-Path "src-tauri\resources\Country.mmdb")) {
    Write-OK "Prebuild artifacts already exist, skipping..."
} else {
    Write-Host "Running prebuild to download mihomo core, service, and geo data..."
    pnpm run prebuild 2>&1 | Write-Host
    Write-OK "Prebuild completed"
}

# ============ Step 9: Build ============
Write-Step "Step 9: Build YSCLUB Windows installer"
Write-Host "This will compile Rust code and create the NSIS installer."
Write-Host "This may take 10-30 minutes depending on your system."
Write-Host ""

# Run the build
$buildStartTime = Get-Date
pnpm run build 2>&1 | Write-Host
$buildExitCode = $LASTEXITCODE
$buildDuration = (Get-Date) - $buildStartTime

Write-Host ""
Write-Host "Build duration: $([math]::Round($buildDuration.TotalMinutes, 1)) minutes"

if ($buildExitCode -ne 0) {
    Write-Err "Build failed with exit code $buildExitCode"
    Write-Host "Common fixes:"
    Write-Host "  1. Ensure VS C++ Build Tools are properly installed"
    Write-Host "  2. Try running 'cargo build' in src-tauri/ for detailed error messages"
    Write-Host "  3. Check that all prebuild artifacts exist"
    exit 1
}

# ============ Step 10: Find installer ============
Write-Step "Step 10: Locate the installer"
$installerPaths = @(
    "src-tauri\target\release\bundle\nsis\YSCLUB_1.0.0_x64-setup.exe",
    "src-tauri\target\release\bundle\nsis\YSCLUB_*.exe"
)

$installer = $null
foreach ($pattern in $installerPaths) {
    $found = Get-ChildItem $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $installer = $found.FullName
        break
    }
}

if ($installer) {
    $sizeMB = [math]::Round((Get-Item $installer).Length / 1MB, 1)
    Write-OK "Installer created successfully!"
    Write-Host ""
    Write-Host "  File: $installer" -ForegroundColor White
    Write-Host "  Size: $sizeMB MB" -ForegroundColor White
    Write-Host ""
    Write-Host "You can install YSCLUB by running this installer." -ForegroundColor Green
    
    # Open the folder
    $folder = Split-Path $installer
    Start-Process explorer.exe -ArgumentList $folder
} else {
    # Search more broadly
    $allInstallers = Get-ChildItem "src-tauri\target\release\bundle\nsis\*.exe" -ErrorAction SilentlyContinue
    if ($allInstallers) {
        Write-OK "Installer(s) found:"
        foreach ($f in $allInstallers) {
            $sizeMB = [math]::Round($f.Length / 1MB, 1)
            Write-Host "  $($f.FullName) ($sizeMB MB)"
        }
        Start-Process explorer.exe -ArgumentList (Split-Path $allInstallers[0].FullName)
    } else {
        Write-Warn "Could not locate installer automatically."
        Write-Host "Check: src-tauri\target\release\bundle\nsis\"
        Write-Host "Or run: dir -Recurse -Filter '*.exe' src-tauri\target\release\bundle\"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YSCLUB build process complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
