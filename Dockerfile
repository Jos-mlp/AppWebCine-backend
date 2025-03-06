FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Asegúrate de que este comando sea el correcto para iniciar tu servidor, por ejemplo "npm run start"
CMD ["node", "server.js"]
