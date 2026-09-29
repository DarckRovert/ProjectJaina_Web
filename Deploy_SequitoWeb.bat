@echo off
setlocal EnableDelayedExpansion
color 0B

:: ==========================================================
:: EL SÉQUITO - DESPLIEGUE A GITHUB PAGES V3.0 🚀
:: ==========================================================
:: Sincronización del portal oficial SequitoWeb en GitHub Pages
:: ==========================================================

set LOG_FILE=%cd%\deploy_log.txt
echo [INIT] Iniciando sincronizacion - %DATE% %TIME% > "%LOG_FILE%"

:: 1. Verificar dependencias
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Git no encontrado en el PATH del sistema.
    echo [!] ERROR: Git no encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: 2. Obtener Fecha Corregida
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set FECHA=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set HORA=%datetime:~8,2%%datetime:~10,2%
set COMMIT_MSG=feat: SequitoWeb GitHub Pages sync %FECHA% %HORA%

echo Procediendo con la sincronizacion del portal...
echo.

:: 3. Ejecutar Despliegue
echo [SequitoWeb] Verificando cambios...
echo [SequitoWeb] --- Start Check: %TIME% --- >> "%LOG_FILE%"

if not exist "%cd%\.git" (
    echo [!] ERROR: Este directorio no es un repositorio git.
    echo [FAIL] No .git directory >> "%LOG_FILE%"
    pause
    exit /b 1
)

git remote set-url origin "https://github.com/DarckRovert/SequitoWeb.git" >> "%LOG_FILE%" 2>&1

set CHANGES_FOUND=0
for /f "tokens=*" %%i in ('git status --porcelain') do (
    set CHANGES_FOUND=1
)

if %CHANGES_FOUND% EQU 0 (
    echo [SKIP] No se detectaron cambios en el portal. Ecosistema al dia.
    echo [SKIP] No changes found >> "%LOG_FILE%"
    timeout /t 3 >nul
    exit /b 0
)

echo [SequitoWeb] Cambios detectados. Iniciando sincronizacion...
echo %COMMIT_MSG% > LAST_DEPLOY_WEB.txt

git add . >> "%LOG_FILE%" 2>&1
git commit -m "%COMMIT_MSG%" >> "%LOG_FILE%" 2>&1
git branch -M main >> "%LOG_FILE%" 2>&1

echo [SequitoWeb] Subiendo a GitHub main...
git push origin main >> "%LOG_FILE%" 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================================
    echo           DESPLIEGUE A GITHUB PAGES EXITOSO
    echo ==========================================================
    echo [OK] SequitoWeb sincronizado en GitHub (rama main).
    echo [OK] El workflow de GitHub Actions desplegara la web en:
    echo      https://darckrovert.github.io/SequitoWeb/
    echo ==========================================================
) else (
    echo.
    echo ==========================================================
    echo [!] FALLO EN EL DESPLIEGUE
    echo ==========================================================
    echo [TIP]: Revisa deploy_log.txt para mas detalles tecnicos.
)

echo [SequitoWeb] --- End: %TIME% --- >> "%LOG_FILE%"
echo.
pause
exit /b 0
