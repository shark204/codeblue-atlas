# Run this once inside F:\codeblue-atlas to copy Atlas modules & 3D GLB assets from F:\mrcs-bank
$src = "F:\mrcs-bank"
$dst = "$PSScriptRoot"

Write-Host "Copying Atlas modules & 3D assets from $src ..." -ForegroundColor Cyan

# Copy shared folders without overwriting standalone entry files in codeblue-atlas
$folders = @("features", "lib", "stores", "components", "config", "public\anatomy", "public\models", "public\atlas-thumbs", "public\draco")
foreach ($rel in $folders) {
  $from = Join-Path $src $rel
  $to   = Join-Path $dst $rel
  if (Test-Path $from) {
    New-Item -ItemType Directory -Force -Path $to | Out-Null
    # Copy only files that do not already exist in codeblue-atlas so standalone overrides stay intact
    Get-ChildItem -Path $from -Recurse -File | ForEach-Object {
      $relPath = $_.FullName.Substring($from.Length).TrimStart("\")
      $targetFile = Join-Path $to $relPath
      if (-not (Test-Path $targetFile)) {
        New-Item -ItemType Directory -Force -Path (Split-Path $targetFile -Parent) | Out-Null
        Copy-Item $_.FullName $targetFile -Force
      }
    }
    Write-Host "Synced $rel" -ForegroundColor Green
  }
}

Write-Host "Done! Now copy .env.local and run: npm install && npm run dev" -ForegroundColor Cyan
