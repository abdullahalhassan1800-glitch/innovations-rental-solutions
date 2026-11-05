@echo off
REM Double-click helper: shows recent Smart App Control blocks.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sac-report.ps1" %*
echo.
pause
