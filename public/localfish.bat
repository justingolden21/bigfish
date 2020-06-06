@ECHO OFF
ECHO    __
ECHO  _^|_ ^|__
ECHO ^|  __^|  ^|
ECHO ^|_^|  ___^|
ECHO   ^|__^|
ECHO Starting server in current directory to port 8000

start chrome --new-tab "http://localhost:8000/"
py -m http.server
PAUSE