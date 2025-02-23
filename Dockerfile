# Этап сборки
FROM node:18 AS builder

# Установка необходимых зависимостей для Electron
WORKDIR /app
COPY package*.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build
RUN npm run electron:build

# Финальный этап с Windows контейнером
FROM mcr.microsoft.com/windows:ltsc2019

# Установка Node.js в Windows контейнер
SHELL ["powershell", "-Command"]
RUN Invoke-WebRequest -Uri https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi -OutFile node.msi; \
    Start-Process msiexec.exe -Wait -ArgumentList '/i', 'node.msi', '/quiet', '/norestart'; \
    Remove-Item -Force node.msi

# Копирование собранного приложения
WORKDIR C:\\app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Запуск приложения
CMD ["powershell", "-Command", ".\\dist\\win-unpacked\\your-app-name.exe"]
