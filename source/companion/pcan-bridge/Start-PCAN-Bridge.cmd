@echo off
setlocal
cd /d "%~dp0"
title ALGO TEAM CAN Viewer - PCAN Local Bridge
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0PCANBridge.ps1"
if errorlevel 1 pause
endlocal
