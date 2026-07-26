$ErrorActionPreference = "Stop"
$host.UI.RawUI.WindowTitle = "Bülent Türk CAN Viewer - PCAN Local Bridge"

Write-Host ""
Write-Host "  PCAN Local Bridge v1.0.0" -ForegroundColor Cyan
Write-Host "  Receive-only bridge for https://bulentturk.com/can-viewer/" -ForegroundColor DarkGray
Write-Host ""

try {
    $sourcePath = Join-Path $PSScriptRoot "PcanLocalBridge.cs"
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "PcanLocalBridge.cs was not found next to this script."
    }
    $source = Get-Content -LiteralPath $sourcePath -Raw
    Add-Type -TypeDefinition $source -Language CSharp
    [PcanLocalBridge.Server]::Run()
}
catch {
    Write-Host ""
    Write-Host "Bridge could not start:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Install the official PEAK-System driver, then run this file again." -ForegroundColor Gray
    Write-Host "Driver: https://www.peak-system.com/quick/DL-Driver-E" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}
