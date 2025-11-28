@echo off
echo ========================================
echo Preparando arquivos para deploy
echo ========================================
echo.

echo [1/3] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/3] Criando build de producao...
call npm run build
if errorlevel 1 (
    echo ERRO: Falha ao criar build
    pause
    exit /b 1
)

echo.
echo [3/3] Copiando .htaccess para pasta out...
copy .htaccess out\.htaccess >nul 2>&1

echo.
echo ========================================
echo CONCLUIDO!
echo ========================================
echo.
echo Os arquivos estao na pasta "out"
echo.
echo PROXIMOS PASSOS:
echo 1. Acesse o Gerenciador de Arquivos da Hostinger
echo 2. Vá até a pasta "public_html"
echo 3. Copie TODOS os arquivos da pasta "out" para "public_html"
echo 4. Acesse: http://seu-dominio-provisorio.com
echo.
pause

