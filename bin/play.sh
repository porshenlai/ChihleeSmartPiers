#!/bin/sh

ROOT=$(realpath $0)
ROOT=${ROOT%/bin/*}

cd ${ROOT}/PWS

if test -f __pyenv__/python.exe; then
	__pyenv__/python.exe daemon.py config.json
else
	__pyenv__/bin/python3 daemon.py config.json
fi
