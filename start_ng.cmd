
@echo off
setlocal enabledelayedexpansion

set "ROOT=C:\Users\HP\Desktop\newsgenie-worker"
set "PORT=8787"
set "EXPECTED_HEAD=139156a"
set "ASSETS=.\public"
set "ENTRY=.\src\index.js"

cd /d "%ROOT%" || (echo [NG] ROOT not found & pause & exit /b 1)

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "STAMP=%%i"
if not exist logs mkdir logs

REM === Git lock ===
set "HEAD="
for /f %%i in ('git rev-parse --short HEAD') do set "HEAD=%%i"
if /i "!HEAD!"=="!EXPECTED_HEAD!" goto HEAD_OK
echo [NG] HEAD mismatch: !HEAD! expected !EXPECTED_HEAD!
echo [NG] Fix: git reset --hard !EXPECTED_HEAD!
pause
exit /b 1
:HEAD_OK
echo [NG] HEAD OK: !HEAD!

REM === Dirty check (tracked only; ignore untracked) ===
set "DIRTY="
for /f "delims=" %%i in ('git status --porcelain --untracked-files=no') do set "DIRTY=1"
if not defined DIRTY goto DIRTY_OK
echo [NG] Local changes found (tracked). Clean first:
echo      git status --porcelain
pause
exit /b 1
:DIRTY_OK

REM === SINGLETON GUARD: if already running, just open and exit (no extra windows) ===
set "LISTEN_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do set "LISTEN_PID=%%a"

set "URL=http://127.0.0.1:%PORT%/?v=%STAMP%"

if not defined LISTEN_PID goto START_NEW
echo [NG] Already running on port %PORT% (PID !LISTEN_PID!). No action.
exit /b 0


:START_NEW
echo [NG] Starting wrangler... logs\wrangler_%STAMP%.log

REM Open browser only AFTER server responds (prevents 'refused to connect')
start "" powershell -NoProfile -WindowStyle Hidden -Command ^
  "$u='%URL%'; $h='http://127.0.0.1:%PORT%/'; for($i=0;$i -lt 120;$i++){ try { Invoke-WebRequest $h -UseBasicParsing -TimeoutSec 1 | Out-Null; Start-Process $u; exit } catch { Start-Sleep -Milliseconds 500 } }"

:RUN
cmd /c npx wrangler dev "%ENTRY%" --port %PORT% --assets "%ASSETS%" 1>>"logs\wrangler_%STAMP%.log" 2>>&1
echo.
echo [NG] Wrangler stopped. Check logs\wrangler_%STAMP%.log
echo [NG] Restarting in 2 seconds...
timeout /t 2 >nul
goto RUN
