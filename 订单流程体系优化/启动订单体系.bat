@echo off
cd /d "%~dp0"
echo 正在启动订单流程体系服务...
echo.
start http://localhost:8800/
py -m http.server 8800
echo.
pause
