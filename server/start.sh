#!/usr/bin/env bash
# Permite correr el script desde cualquier directorio: cambia al directorio del script
cd "$(dirname "$0")"
json-server --watch db.json --routes routes.json --port 3000
