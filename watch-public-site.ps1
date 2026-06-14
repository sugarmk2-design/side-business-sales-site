param(
  [string]$Source = "C:\Users\User1\副業\side_business-local\会社\開発部\sales-site",
  [string]$Destination = $PSScriptRoot,
  [int]$DebounceSeconds = 2,
  [switch]$Once
)

$ErrorActionPreference = "Stop"

$syncScript = Join-Path $PSScriptRoot "sync-public-site.ps1"
if (-not (Test-Path -LiteralPath $syncScript -PathType Leaf)) {
  throw "Sync script was not found: $syncScript"
}

function Invoke-PublicSiteSync {
  Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Sync started."
  & $syncScript -Source $Source -Destination $Destination
  Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Sync finished."
}

if ($Once) {
  Invoke-PublicSiteSync
  return
}

if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
  throw "Source folder was not found: $Source"
}

Write-Host "Watching source folder: $Source"
Write-Host "Destination folder: $Destination"
Write-Host "Press Ctrl+C to stop."

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $Source
$watcher.IncludeSubdirectories = $true
$watcher.Filter = "*.*"
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'
$watcher.EnableRaisingEvents = $true

$lastRun = Get-Date "2000-01-01"
$pending = $false

$action = {
  $script:pending = $true
}

$subscriptions = @(
  Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action,
  Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action,
  Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $action,
  Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $action
)

try {
  while ($true) {
    Start-Sleep -Milliseconds 500
    if (-not $pending) {
      continue
    }

    $now = Get-Date
    if (($now - $lastRun).TotalSeconds -lt $DebounceSeconds) {
      continue
    }

    $pending = $false
    $lastRun = $now
    try {
      Invoke-PublicSiteSync
    } catch {
      Write-Error $_
    }
  }
} finally {
  foreach ($subscription in $subscriptions) {
    Unregister-Event -SubscriptionId $subscription.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $subscription.Id -Force -ErrorAction SilentlyContinue
  }
  $watcher.Dispose()
}
