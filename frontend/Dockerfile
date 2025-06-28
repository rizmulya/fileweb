FROM node:22.8.0-alpine

WORKDIR /app/frontend

COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build