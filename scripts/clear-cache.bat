@echo off
echo 🧹 Clearing Next.js cache and restarting...
echo.

echo 1. Clearing .next directory...
if exist ".next" (
    rmdir /s /q ".next"
    echo    ✅ .next directory cleared
) else (
    echo    ℹ️  .next directory not found
)

echo 2. Clearing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo    ✅ node_modules cache cleared
) else (
    echo    ℹ️  node_modules cache not found
)

echo.
echo 3. Browser cache instructions:
echo    📱 Mobile: Clear browser data or use incognito mode
echo    💻 Desktop: Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
echo    🔄 Or open Developer Tools → Application → Storage → Clear storage

echo.
echo 4. Restarting development server...
echo    Run: npm run dev

echo.
echo ✨ Cache cleared! Please restart your development server manually.
echo    This helps resolve authentication and session issues.

pause 