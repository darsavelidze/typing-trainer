#!/bin/bash

# Fast Typing Trainer - Startup Script

echo "🚀 Запуск Fast Typing Trainer..."

# Проверка Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не установлен"
    exit 1
fi

echo "✓ Python3 найден"

# Создание и активация виртуального окружения (если его нет)
if [ ! -d "venv" ]; then
    echo "📦 Создание виртуального окружения..."
    python3 -m venv venv
fi

echo "✓ Активация виртуального окружения"
source venv/bin/activate

# Установка зависимостей
echo "📥 Установка зависимостей..."
pip install -r requirements.txt

# Запуск приложения
echo "✓ Запуск приложения Flask..."
python app.py
