@echo off
REM Set up the Node.js environment
echo Checking for Node.js dependencies...
if not exist node_modules (
    echo Installing Node.js dependencies...
    npm install
)

REM Set up the Python virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate the virtual environment
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Run the Python backend
echo Starting Python backend...
start cmd /k "venv\Scripts\activate && python backend.py"

REM Run the Node.js server
echo Starting Node.js server...
start cmd /k "node server.js"

REM Keep the main window open
echo Both servers are now running. Close this window to stop them.
pause
