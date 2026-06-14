param(
  [string]$Source = "C:\Users\User1\副業\side_business-local\会社\開発部\sales-site",
  [string]$Destination = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

$publicFiles = @(
  "index.html",
  "article.html",
  "robots.txt",
  "llms.txt",
  "data\articles.js",
  "scripts\app.js",
  "styles\styles.css",
  "assets\images\antigravity-textbook.png",
  "assets\images\codex-starter-kit-brain.png",
  "assets\images\note-marketing-sales-strategy.png",
  "assets\images\side-hustle-books-note.png",
  "assets\images\side-hustle-desk-banner-v2.png",
  "assets\images\workspace-setup-note.png"
)

if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
  throw "Source folder was not found: $Source"
}

if (-not (Test-Path -LiteralPath $Destination -PathType Container)) {
  throw "Destination folder was not found: $Destination"
}

foreach ($relativePath in $publicFiles) {
  $sourcePath = Join-Path $Source $relativePath
  $destinationPath = Join-Path $Destination $relativePath

  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Required source file was not found: $sourcePath"
  }

  $destinationFolder = Split-Path -Parent $destinationPath
  if (-not (Test-Path -LiteralPath $destinationFolder -PathType Container)) {
    New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
  }

  Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
}

$results = foreach ($relativePath in $publicFiles) {
  $sourceHash = (Get-FileHash -LiteralPath (Join-Path $Source $relativePath) -Algorithm SHA256).Hash
  $destinationHash = (Get-FileHash -LiteralPath (Join-Path $Destination $relativePath) -Algorithm SHA256).Hash
  [PSCustomObject]@{
    File = $relativePath
    Synced = ($sourceHash -eq $destinationHash)
  }
}

$results | Format-Table -AutoSize

if (($results | Where-Object { -not $_.Synced }).Count -gt 0) {
  throw "Some public files did not sync correctly."
}

Write-Host "Public site sync completed."
Write-Host "Next steps: git status, git add ., git commit, git push"
