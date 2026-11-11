@echo off
chcp 65001 >nul
echo ========================================================
echo   TWP Training System - 1-Click GitHub Push
echo ========================================================
echo.
echo [1/2] Fetching and syncing with GitHub...
git fetch origin
git merge origin/main --allow-unrelated-histories -X ours -m "Sync: auto-merge before push" --no-edit >nul 2>&1
echo [2/2] Pushing latest code to GitHub (origin/main)...
git push origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   SUCCESS: ซิงค์และส่งข้อมูลขึ้น GitHub สำเร็จ 100%%
    echo ========================================================
) else (
    echo ========================================================
    echo   NOTICE: หากมีปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต
    echo ========================================================
)
echo.
pause
