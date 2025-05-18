FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Rodar prisma generate no build para gerar o client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
