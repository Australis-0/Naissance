@echo off
title Naissance - Test Client
:main
npm start
timeout /t 30
echo [Naissance] Process terminated. Restarting.
goto main
