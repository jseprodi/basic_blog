# PowerShell script to clear Next.js cache and restart development server
Write-Host "🧹 Clearing Next.js cache and restarting..." -ForegroundColor Cyan
Write-Host ""

try {
    # Clear Next.js cache
    Write-Host "1. Clearing .next directory..." -ForegroundColor Yellow
    if (Test-Path ".next") {
        Remove-Item -Path ".next" -Recurse -Force
        Write-Host "   ✅ .next directory cleared" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  .next directory not found" -ForegroundColor Gray
    }

    # Clear node_modules/.cache if it exists
    Write-Host "2. Clearing node_modules cache..." -ForegroundColor Yellow
    $cachePath = Join-Path "node_modules" ".cache"
    if (Test-Path $cachePath) {
        Remove-Item -Path $cachePath -Recurse -Force
        Write-Host "   ✅ node_modules cache cleared" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  node_modules cache not found" -ForegroundColor Gray
    }

    # Clear browser cache instructions
    Write-Host ""
    Write-Host "3. Browser cache instructions:" -ForegroundColor Yellow
    Write-Host "   📱 Mobile: Clear browser data or use incognito mode" -ForegroundColor White
    Write-Host "   💻 Desktop: Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)" -ForegroundColor White
    Write-Host "   🔄 Or open Developer Tools → Application → Storage → Clear storage" -ForegroundColor White

    Write-Host ""
    Write-Host "4. Restarting development server..." -ForegroundColor Yellow
    Write-Host "   Run: npm run dev" -ForegroundColor White
    
    Write-Host ""
    Write-Host "✨ Cache cleared! Please restart your development server manually." -ForegroundColor Green
    Write-Host "   This helps resolve authentication and session issues." -ForegroundColor Green

} catch {
    Write-Host "❌ Error clearing cache: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 