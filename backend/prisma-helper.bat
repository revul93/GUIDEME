@echo off
setlocal enabledelayedexpansion

REM Prisma Helper Script for Windows
REM Quick commands for common Prisma operations

title GuideMe - Prisma Helper

:header
cls
echo ================================================
echo   GuideMe - Prisma Helper Script (Windows)
echo ================================================
echo.

:menu
echo Available Commands:
echo.
echo   1) Generate      - Generate Prisma Client
echo   2) Migrate       - Create and apply migration
echo   3) Migrate-Prod  - Apply migrations (production)
echo   4) Studio        - Open Prisma Studio
echo   5) Seed          - Seed database with initial data
echo   6) Reset         - Reset database (WARNING: deletes all data)
echo   7) Push          - Push schema changes without migration
echo   8) Pull          - Pull schema from database
echo   9) Format        - Format Prisma schema
echo   10) Validate     - Validate Prisma schema
echo.
echo   0) Exit
echo.

set /p choice="Select an option: "
echo.

if "%choice%"=="1" goto generate
if "%choice%"=="2" goto migrate
if "%choice%"=="3" goto migrate_prod
if "%choice%"=="4" goto studio
if "%choice%"=="5" goto seed
if "%choice%"=="6" goto reset
if "%choice%"=="7" goto push
if "%choice%"=="8" goto pull
if "%choice%"=="9" goto format
if "%choice%"=="10" goto validate
if "%choice%"=="0" goto end

echo Invalid option
pause
goto header

:generate
echo Generating Prisma Client...
call npx prisma generate
echo.
echo [OK] Prisma Client generated
pause
goto header

:migrate
echo Creating migration...
set /p migration_name="Enter migration name: "
call npx prisma migrate dev --name "%migration_name%"
echo.
echo [OK] Migration created and applied
pause
goto header

:migrate_prod
echo Applying migrations to production...
call npx prisma migrate deploy
echo.
echo [OK] Migrations applied
pause
goto header

:studio
echo Opening Prisma Studio...
call npx prisma studio
pause
goto header

:seed
echo Seeding database...
call node prisma/seed.js
echo.
echo [OK] Database seeded
pause
goto header

:reset
echo.
echo WARNING: This will delete all data!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    echo Resetting database...
    call npx prisma migrate reset --force
    echo.
    echo [OK] Database reset
) else (
    echo Reset cancelled
)
pause
goto header

:push
echo Pushing schema changes...
call npx prisma db push
echo.
echo [OK] Schema pushed
pause
goto header

:pull
echo Pulling schema from database...
call npx prisma db pull
echo.
echo [OK] Schema pulled
pause
goto header

:format
echo Formatting Prisma schema...
call npx prisma format
echo.
echo [OK] Schema formatted
pause
goto header

:validate
echo Validating Prisma schema...
call npx prisma validate
echo.
echo [OK] Schema is valid
pause
goto header

:end
echo Goodbye!
exit /b 0
