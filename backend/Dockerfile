From node:18
WORKDIR /app

COPY package.json package-lock.json ./
run npm install

COPY . .

CMD ["npm", "dist/server.js"]