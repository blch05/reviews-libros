#!/bin/bash

# Script de backup para CI/CD
echo "🔍 Checking Vitest configuration..."

# Verificar si existe el archivo de configuración en la raíz
if [ -f "vitest.config.mjs" ]; then
    echo "✅ Found vitest.config.mjs in root directory"
    ls -la vitest.config.mjs
elif [ -f "vitest.config.js" ]; then
    echo "✅ Found vitest.config.js in root directory"
    ls -la vitest.config.js
else
    echo "❌ No Vitest configuration file found in root directory"
    echo "Current directory:"
    pwd
    echo "Files in current directory:"
    ls -la
    exit 1
fi

# Ejecutar tests con información adicional
echo "🧪 Running tests..."
npm run test:run
