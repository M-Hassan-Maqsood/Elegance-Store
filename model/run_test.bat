@echo off
.\run_test.bat
echo Running image similarity test...
python test_specific_image.py
echo.
echo Press any key to exit...
pause > nul