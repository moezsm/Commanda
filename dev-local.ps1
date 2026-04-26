#Requires -Version 5.1
<#
.SYNOPSIS
    Starts Commanda fully local for development and testing.
    Launches local Supabase (Docker) + Next.js at http://localhost:3000.

.DESCRIPTION
    Run from anywhere — the script resolves paths automatically.
    Does NOT touch production/Vercel deployment or hosted Supabase.

.USAGE
    .\dev-local.ps1               # start everything
    .\dev-local.ps1 -Stop         # stop local Supabase containers
    .\dev-local.ps1 -SkipMigrate  # skip running DB migrations
#>
param(
    [switch]$Stop,
    [switch]$SkipMigrate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Paths ──────────────────────────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppDir    = Join-Path $ScriptDir 'app'

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "    [OK] $msg"   -ForegroundColor Green }
function Write-Fail  { param($msg) Write-Host "    [!!] $msg"   -ForegroundColor Red; exit 1 }
function Write-Info  { param($msg) Write-Host "    [..] $msg"   -ForegroundColor DarkGray }

# ── STOP mode ─────────────────────────────────────────────────────────────────
if ($Stop) {
    Write-Step 'Stopping local Supabase containers'
    Push-Location $AppDir
    try {
        npm run supabase:local:stop
        Write-Ok 'Supabase stopped.'
    } finally {
        Pop-Location
    }
    exit 0
}

# ── 1. Docker check ───────────────────────────────────────────────────────────
Write-Step 'Checking Docker'
try {
    $dockerVersion = docker --version 2>&1
    Write-Ok $dockerVersion
} catch {
    Write-Fail 'Docker not found. Install Docker Desktop and make sure it is Running.'
}

# Test the daemon is actually responding
try {
    docker info --format '{{.ServerVersion}}' 2>&1 | Out-Null
    Write-Ok 'Docker engine is running.'
} catch {
    Write-Fail 'Docker engine is not responding. Open Docker Desktop and wait until it shows Running.'
}

# ── 2. Node / npm check ───────────────────────────────────────────────────────
Write-Step 'Checking Node.js'
try {
    $nodeVersion = node --version 2>&1
    Write-Ok "Node $nodeVersion"
} catch {
    Write-Fail 'Node.js not found. Install Node 20+.'
}

# ── 3. npm install (if node_modules missing) ──────────────────────────────────
Write-Step 'Ensuring npm dependencies'
$nodeModules = Join-Path $AppDir 'node_modules'
if (-not (Test-Path $nodeModules)) {
    Write-Info 'node_modules not found — running npm install...'
    Push-Location $AppDir
    try {
        npm install
    } finally {
        Pop-Location
    }
    Write-Ok 'Dependencies installed.'
} else {
    Write-Ok 'node_modules present, skipping install.'
}

# ── 4. Start local Supabase ───────────────────────────────────────────────────
Write-Step 'Starting local Supabase stack (this may take a minute on first run)'
Push-Location $AppDir
try {
    npm run supabase:local:start
    Write-Ok 'Supabase containers are up.'
} catch {
    Write-Fail "Supabase failed to start.`nCheck that Docker Desktop is Running and no port conflicts exist (54321, 54322)."
} finally {
    Pop-Location
}

# ── 5. Generate .env.local from local Supabase status ─────────────────────────
Write-Step 'Writing app/.env.local from local Supabase credentials'
Push-Location $AppDir
try {
    npm run supabase:local:env
    Write-Ok 'app/.env.local updated with local credentials.'
} catch {
    Write-Fail 'Could not generate .env.local. Is Supabase running?'
} finally {
    Pop-Location
}

# Verify the file was written and points to localhost
$envLocalPath = Join-Path $AppDir '.env.local'
if (-not (Test-Path $envLocalPath)) {
    Write-Fail '.env.local was not created.'
}
$envContent = Get-Content $envLocalPath -Raw
if ($envContent -notmatch 'localhost|127\.0\.0\.1') {
    Write-Fail '.env.local does not appear to point to local Supabase. Check scripts/local-supabase-env.js output.'
}
Write-Ok '.env.local is pointing to local Supabase.'

# ── 6. Run DB migrations ───────────────────────────────────────────────────────
if (-not $SkipMigrate) {
    Write-Step 'Running database migrations against local Supabase'
    Push-Location $AppDir
    try {
        npm run migrate
        Write-Ok 'Migrations applied.'
    } catch {
        Write-Fail "Migration failed.`nCheck supabase/migrations/ for SQL errors or run with -SkipMigrate to bypass."
    } finally {
        Pop-Location
    }
} else {
    Write-Info 'Skipping migrations (-SkipMigrate flag set).'
}

# ── 7. Launch Next.js dev server ──────────────────────────────────────────────
Write-Step 'Launching Next.js dev server at http://localhost:3000'
Write-Info 'Press Ctrl+C to stop the dev server.'
Write-Info 'To stop Supabase afterwards, run:  .\dev-local.ps1 -Stop'
Write-Host ''

Push-Location $AppDir
try {
    npm run dev
} finally {
    Pop-Location
}
