@echo off
REM Para tudo antes de iniciar
call "%~dp0stop-check-in-car.bat"

REM Inicia backend
start "" "%~dp0start-backend.bat"

REM Inicia frontend (Vite) em nova janela
start "" cmd /k "cd /d E:/Projeto-Controle-Estoque/Controle-de-Estoque-WEB-Front && yarn dev"

exit
