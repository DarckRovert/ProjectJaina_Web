@echo off
setlocal EnableDelayedExpansion
color 0B

if exist "C:\Program Files\Git\cmd" set "PATH=C:\Program Files\Git\cmd;%PATH%"

REM ==========================================================
REM PROJECT JAINA - DESPLIEGUE A GITHUB PAGES
REM ==========================================================
REM Portal Oficial: https://darckrovert.github.io/ProjectJaina_Web/
REM Repositorio: https://github.com/DarckRovert/ProjectJaina_Web.git
REM ==========================================================

set LOG_FILE=%cd%\deploy_log.txt
echo [INIT] Iniciando sincronizacion ProjectJaina_Web - %DATE% %TIME% > "%LOG_FILE%"

REM 1. Verificar Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Git no encontrado en el PATH del sistema.
    echo [!] ERROR: Git no encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: 2. Fecha y Mensaje de Commit
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set FECHA=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set HORA=%datetime:~8,2%%datetime:~10,2%
set COMMIT_MSG=feat(web): sincronizacion portal Project Jaina %FECHA% %HORA%

echo ==========================================================
echo      PROJECT JAINA WEB - SINCRONIZADOR A GITHUB PAGES
echo ==========================================================
echo.

if not exist "%cd%\.git" (
    echo [!] ERROR: Este directorio no es un repositorio git.
    echo [FAIL] No .git directory >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: 3. Asegurar remote canónico
git remote set-url origin "https://github.com/DarckRovert/ProjectJaina_Web.git" >> "%LOG_FILE%" 2>&1

set CHANGES_FOUND=0
for /f "tokens=*" %%i in ('git status --porcelain') do (
    set CHANGES_FOUND=1
)

if %CHANGES_FOUND% EQU 0 (
    echo [SKIP] No se detectaron cambios pendientes. Web al dia.
    echo [SKIP] No changes found >> "%LOG_FILE%"
    timeout /t 3 >nul
    exit /b 0
)

echo [ProjectJaina] Detectados cambios en el portal. Empaquetando...
echo %COMMIT_MSG% > LAST_DEPLOY_WEB.txt

git add . >> "%LOG_FILE%" 2>&1
git commit -m "%COMMIT_MSG%" >> "%LOG_FILE%" 2>&1
git branch -M main >> "%LOG_FILE%" 2>&1

echo [ProjectJaina] Empujando a GitHub (rama main)...
git push origin main >> "%LOG_FILE%" 2>&1

echo [ProjectJaina] Sincronizando rama gh-pages...
git push origin main:gh-pages --force >> "%LOG_FILE%" 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================================
    echo           DESPLIEGUE A GITHUB PAGES EXITOSO
    echo ==========================================================
    echo [OK] Project Jaina Web sincronizado en GitHub (main y gh-pages).
    echo [OK] Portal activo en vivo:
    echo      https://darckrovert.github.io/ProjectJaina_Web/
    echo ==========================================================
) else (
    echo.
    echo ==========================================================
    echo [!] HUBO UN INCONVENIENTE EN EL PUSH
    echo ==========================================================
    echo [TIP]: Revisa deploy_log.txt para ver el registro detallado.
)

echo [ProjectJaina] --- Fin: %TIME% --- >> "%LOG_FILE%"
echo.
pause
exit /b 0
