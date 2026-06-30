param(
  [string]$Source = "C:\Users\User1\副業\side_business-local\会社\開発部\sales-site",
  [string]$Destination = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

$publicFiles = @(
  "index.html",
  "article.html",
  "privacy.html",
  "disclaimer.html",
  "contact.html",
  "review-policy.html",
  "robots.txt",
  "llms.txt",
  "sitemap.xml",
  "data\articles.js",
  "scripts\app.js",
  "scripts\analytics.js",
  "styles\styles.css",
  "articles\otani-seven-words-note\index.html",
  "articles\antigravity-textbook-review\index.html",
  "articles\codex-starter-kit-brain\index.html",
  "articles\note-marketing-sales-strategy\index.html",
  "articles\side-hustle-books-note\index.html",
  "articles\workspace-setup-note\index.html",
  "articles\side-business-beginner-start-guide\index.html",
  "articles\note-sales-start-guide\index.html",
  "articles\brain-material-selection-guide\index.html",
  "articles\paid-note-not-selling-reasons\index.html",
  "articles\ai-note-writing-workflow\index.html",
  "assets\images\antigravity-textbook.png",
  "assets\images\antigravity-textbook.webp",
  "assets\images\codex-starter-kit-brain.png",
  "assets\images\codex-starter-kit-brain.webp",
  "assets\images\note-marketing-sales-strategy.png",
  "assets\images\note-marketing-sales-strategy.webp",
  "assets\images\side-hustle-books-note.png",
  "assets\images\side-hustle-books-note.webp",
  "assets\images\side-hustle-desk-banner-v2.png",
  "assets\images\side-hustle-desk-banner-v2.webp",
  "assets\images\workspace-setup-note.png",
  "assets\images\workspace-setup-note.webp"
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
