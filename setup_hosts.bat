@echo off
:: Batch script to map insidefactz.xyz to localhost in Windows hosts file
:: Must be run as Administrator
echo.
echo =======================================================
echo  InsideFactz Academy Custom Domain Setup
echo =======================================================
echo.

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with administrative privileges.
) else (
    echo [ERROR] This script MUST be run as Administrator.
    echo Please right-click this file and select 'Run as Administrator'.
    echo.
    pause
    exit /b 1
)

:: Define host details
set "host_line=127.0.0.1 insidefactz.xyz"
set "hosts_path=%SystemRoot%\System32\drivers\etc\hosts"

:: Check if entry already exists
findstr /C:"insidefactz.xyz" "%hosts_path%" >nul
if %errorLevel% == 0 (
    echo [OK] insidefactz.xyz is already mapped in your hosts file.
) else (
    echo Adding mapping: %host_line%
    echo. >> "%hosts_path%"
    echo %host_line% >> "%hosts_path%"
    echo [SUCCESS] Domain insidefactz.xyz has been mapped to 127.0.0.1!
)

echo.
echo You can now open http://insidefactz.xyz in your browser.
echo.
pause
