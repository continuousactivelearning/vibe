#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
$StateFile = ".vibe.json"

Write-Host "🚀 ViBe Setup Script"

# Initialize WASCLONED
$global:WASCLONED = $false

function Clone-Repo {
    Write-Host "📦 Cloning ViBe repository..."
    git clone https://github.com/continuousactivelearning/vibe.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to clone the repository."
        exit 1
    }
    $global:WASCLONED = $true
    Set-Location vibe
}

function Check-Repo {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git is not installed."
        Write-Host "Please install Git from https://git-scm.com/download/win"
        exit 1
    }
    try {
        git rev-parse --is-inside-work-tree > $null
        Write-Host "✅ This is a Git repository."
      } catch {
        Write-Host "⚠️ Not a Git repository. Cloning..."
        Clone-Repo
        Set-Location "./vibe"
      }
}

function Exists-Node {
    return (Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm -ErrorAction SilentlyContinue)
}

function Install-PNPM {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing pnpm..."
        Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
    }
    # Refresh session path
    $Env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Failed to install pnpm. Please restart PowerShell and try again."
        exit 1
    }
    Write-Host "✅ pnpm: $(pnpm -v)"
}

function Install-NodeDependencies {
    Write-Host "📦 Installing required Node.js dependencies..."
    pnpm install -g tsx
    if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
        pnpm install -g firebase-tools
    }
    pnpm install
}

function Install-CLI {
    Write-Host "⚙ Installing CLI..."
    Push-Location cli
    pnpm link --global
    Pop-Location
    Write-Host "✅ ViBe CLI installed and linked globally."
}

function Init-State {
    if (-not (Test-Path $StateFile)) {
        '{}' | Out-File -Encoding UTF8 $StateFile
        Write-Host "📄 Created $StateFile"
    }
}

function Check-Node {
    if (Exists-Node) {
        $currentNode = node -v
        Write-Host "✅ Node.js found: $currentNode"
        $required = [version]"23.0.0"
        $installed = [version]($currentNode.TrimStart('v'))
        if ($installed -lt $required) {
            Write-Host "❌ Node.js is too old. Installing NVM for Windows..."
            Invoke-WebRequest `
              https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.zip `
              -OutFile "nvm-setup.zip"
            Expand-Archive -Path "nvm-setup.zip" -DestinationPath "."
            Start-Process .\nvm-setup.exe -Wait
            Write-Host "Please run `nvm install 23` after the installer completes."
            exit 1
        }
    } else {
        Write-Host "Node.js not found. Installing NVM for Windows..."
        Invoke-WebRequest `
          https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.zip `
          -OutFile "nvm-setup.zip"
        Expand-Archive -Path "nvm-setup.zip" -DestinationPath "."
        Start-Process .\nvm-setup.exe -Wait
        Write-Host "Please run `nvm install 23` after the installer completes."
        exit 1
    }
}

# --- MAIN ---

# If we’re in the scripts folder, go up one level
if ((Get-Location).Path -like "*\scripts") {
    Set-Location ..
}

Check-Repo
Install-PNPM
Check-Node
Install-NodeDependencies
Install-CLI
Init-State

# Run initial vibe setup
vibe setup

if ($global:WASCLONED) {
    Write-Host "➡️  Do `cd vibe` to enter the project directory."
}

Write-Host "🎉 Setup complete! Restart PowerShell or reload your environment to start using the ViBe CLI."
