@echo off
title Project Jaina - Despliegue en GitHub Pages
color 0B
echo ===============================================================================
echo   PUBLICADOR AUTOMATICO DE PORTAL WEB A GITHUB PAGES (PROJECT JAINA)
echo ===============================================================================
echo.

if not exist .git (
    echo [1/4] Inicializando repositorio Git local...
    git init
    git branch -M main
) else (
    echo [1/4] Repositorio Git existente detectado.
)

echo [2/4] Agregando archivos del portal...
git add .
git commit -m "Deploy: Project Jaina Official Web Portal (Living Lore & AI Revolution)"

echo.
echo [3/4] Comprobando control remoto...
git remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo.
    echo [CONFIGURACION INICIAL REQUERIDA]
    echo Ingresa la URL de tu repositorio de GitHub para el portal:
    echo (Ejemplo: https://github.com/DarckRovert/ProjectJaina_Portal.git)
    set /p REPO_URL="URL del repositorio: "
    if not "%REPO_URL%"=="" (
        git remote add origin %REPO_URL%
    )
)

echo.
echo [4/4] Subiendo a GitHub...
git push -u origin main

echo.
echo ===============================================================================
echo   LISTO! Para activar GitHub Pages en tu repositorio:
echo   1. Ve a tu repositorio en GitHub -> Settings -> Pages
echo   2. En "Source", selecciona "Deploy from a branch" -> Rama "main" / Root
echo   3. Guarda los cambios. Tu portal estara en linea en segundos.
echo ===============================================================================
pause
