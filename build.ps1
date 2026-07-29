# YSCLUB Build Script
# Right-click -> "Run with PowerShell" (Run as Administrator)

$ErrorActionPreference = "Stop"

function OK($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function ERR($msg)  { Write-Host "[ERR] $msg" -ForegroundColor Red }
function WARN($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function STEP($msg) { Write-Host "`n========== $msg ==========" -ForegroundColor Cyan }

# ============ Check Admin ============
STEP "Check Administrator"
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    ERR "Please run as Administrator!"
    ERR "Right-click this file -> 'Run with PowerShell' (as Administrator)"
    pause
    exit 1
}
OK "Administrator confirmed"

# ============ Setup Environment ============
STEP "Setup Environment"
$env:HTTP_PROXY  = "http://127.0.0.1:7897"
$env:HTTPS_PROXY = "http://127.0.0.1:7897"
$env:http_proxy  = "http://127.0.0.1:7897"
$env:https_proxy = "http://127.0.0.1:7897"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:RUST_BACKTRACE = "short"
$env:CARGO_NET_GIT_FETCH_WITH_CLI = "true"
OK "Environment set"

# ============ Enter Project ============
STEP "Enter Project Directory"
$project = "C:\Users\Administrator\Desktop\clash-verge-rev-dev"
Set-Location $project
OK "Directory: $project"

# ============ Step 1: C++ Build Tools ============
STEP "Step 1/4: Check C++ Build Tools"

$vswhere = "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe"
$hasVc = & $vswhere -all -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null | Select-Object -First 1

if ($hasVc) {
    OK "C++ Build Tools found at: $hasVc"
} else {
    WARN "C++ Build Tools NOT found"
    Write-Host ""
    Write-Host "Please install manually:"
    Write-Host "  1. Open Visual Studio Installer"
    Write-Host "  2. Click 'Modify' on Visual Studio Community 2026"
    Write-Host "  3. Check 'Desktop development with C++'"
    Write-Host "  4. Click 'Modify' to install"
    Write-Host ""
    Write-Host "Opening Visual Studio Installer now..."
    Write-Host ""

    # Try auto-install first
    $setup = "C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe"
    if (Test-Path $setup) {
        # VS Installer has issues with paths containing spaces in auto mode.
        # Just open the installer and let the user do it manually.
        Start-Process $setup
        Write-Host ""
        Write-Host "VS Installer opened. Please:"
        Write-Host "  1. Click 'Modify' on Visual Studio Community 2026"
        Write-Host "  2. Check 'Desktop development with C++'"
        Write-Host "  3. Click 'Modify' to install"
        Write-Host "  4. Wait ~10-20 min for installation"
        Write-Host ""
        Write-Host "Press any key after installation is complete..."
        pause

        # Verify after manual install
        $hasVc = & $vswhere -all -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null | Select-Object -First 1
        if ($hasVc) {
            OK "C++ Build Tools installed successfully!"
        } else {
            ERR "C++ Build Tools still not detected."
            ERR "Please make sure 'Desktop development with C++' is fully installed."
            ERR "Then re-run this script."
            pause
            exit 1
        }
    }
}

# ============ Step 2: Dependencies ============
STEP "Step 2/4: Install Dependencies"
if (Test-Path "node_modules") {
    OK "node_modules exists"
} else {
    Write-Host "Running npm install..."
    npm install 2>&1 | Write-Host
    if ($LASTEXITCODE -ne 0) { ERR "npm install failed"; pause; exit 1 }
    OK "npm install done"
}

# ============ Step 3: Build Frontend ============
STEP "Step 3/4: Build Frontend"
npm run web:build 2>&1 | Write-Host
if ($LASTEXITCODE -ne 0) { ERR "Frontend build failed"; pause; exit 1 }
OK "Frontend build done"

# ============ Step 4: Build YSCLUB ============
STEP "Step 4/4: Build YSCLUB Installer"
Write-Host "This takes 10-30 minutes. Please wait..."
Write-Host "Start: $(Get-Date)"
Write-Host ""

$startTime = Get-Date
npx tauri build 2>&1 | Write-Host
$exitCode = $LASTEXITCODE
$duration = (Get-Date) - $startTime

Write-Host ""
Write-Host "Duration: $([math]::Round($duration.TotalMinutes,1)) minutes"

if ($exitCode -ne 0) {
    ERR "Build failed!"
    Write-Host ""
    Write-Host "Please copy the error message above and send it."
    pause
    exit 1
}

# ============ Find Installer ============
STEP "Find Installer"
$bundleDir = "src-tauri\target\release\bundle\nsis"
$installers = Get-ChildItem "$bundleDir\*.exe" -ErrorAction SilentlyContinue

if ($installers) {
    foreach ($f in $installers) {
        $sizeMB = [math]::Round($f.Length / 1MB, 1)
        OK "$($f.Name) ($sizeMB MB)"
    }
    Start-Process explorer.exe -ArgumentList (Resolve-Path $bundleDir).Path
    Write-Host ""
    Write-Host "Installer folder opened! Double-click the .exe to install YSCLUB."
} else {
    WARN "Installer not found in $bundleDir"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  YSCLUB Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
pause