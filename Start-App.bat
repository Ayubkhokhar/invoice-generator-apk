@echo off
chcp 65001 > nul
title نظام إدارة الفواتير وعروض الأسعار
echo ========================================================
echo       نظام إدارة الفواتير وعروض الأسعار (Mayar Invoicing)
echo ========================================================
echo.
echo جاري تشغيل النظام أوفلاين...
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

start "" "C:\Program Files\nodejs\node.exe" server.js
timeout /t 2 /nobreak > nul

start http://localhost:3000

echo تم فتح النظام بنجاح في المتصفح!
echo يمكنك إبقاء هذه النافذة مفتوحة أثناء استخدام النظام.
echo.
pause
