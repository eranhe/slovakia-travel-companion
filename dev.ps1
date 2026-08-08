# Starts the dev server even when Node is not on the system PATH.
# Usage:  .\dev.ps1          (dev server)
#         .\dev.ps1 build    (any npm script)

$portableNode = "$env:LOCALAPPDATA\nodejs\node-v24.19.0-win-x64"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    if (Test-Path (Join-Path $portableNode 'npm.cmd')) {
        $env:PATH = "$portableNode;$env:PATH"
        Write-Host "Using portable Node from $portableNode" -ForegroundColor DarkGray
    }
    else {
        Write-Error "npm not found. Install Node.js or place a portable copy in $portableNode"
        exit 1
    }
}

Set-Location $PSScriptRoot

$script = if ($args.Count -gt 0) { $args[0] } else { 'dev' }
$rest = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] } else { @() }

npm run $script @rest
