@echo off
setlocal EnableDelayedExpansion
color 0B

:: ==========================================================
:: EL SEQUITO DEL TERROR - DESPLIEGUE WEB GOD-TIER V2.0 PRO 🚀
:: ==========================================================
:: Optimizacion: Gravity AI Bridge - Senior Audit Mode
:: Proposito: Sincronizacion del portal oficial SequitoWeb
:: ==========================================================

set LOG_FILE=%cd%\deploy_log.txt
echo [INIT] Iniciando despliegue de alta disponibilidad - %DATE% %TIME% > "%LOG_FILE%"

:: 1. Verificar dependencias
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Git no encontrado en el PATH del sistema.
    echo [!] ERROR: Git no encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: 2. Obtener Fecha Corregida (Independiente de Localizacion)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set FECHA=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set HORA=%datetime:~8,2%%datetime:~10,2%
set COMMIT_MSG=feat: SequitoWeb Diamond-Tier deployment %FECHA% %HORA%

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

:: Sincronizar URL de Remote por seguridad
git remote set-url origin "https://github.com/DarckRovert/SequitoWeb.git" >> "%LOG_FILE%" 2>&1

:: Verificar si hay cambios reales
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

:: Asegurar rama main
git branch -M main >> "%LOG_FILE%" 2>&1

:: Push a main y asegurar master (Dual-Push)
echo [SequitoWeb] Subiendo a GitHub...
git push origin main HEAD:master --force >> "%LOG_FILE%" 2>&1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================================
    echo           RESUMEN DE OPERACION COMMANDER
    echo ==========================================================
    echo [OK] SequitoWeb sincronizado en GitHub.
    echo [OK] Ramas main/master actualizadas.
    echo ==========================================================
) else (
    echo.
    echo ==========================================================
    echo [!] FALLO CRITICO EN EL DESPLIEGUE
    echo ==========================================================
    echo [TIP]: Revisa deploy_log.txt para mas detalles técnicos.
)

echo [SequitoWeb] --- End: %TIME% --- >> "%LOG_FILE%"
echo.
pause
exit /b 0
