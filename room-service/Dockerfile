From node:18
WORKDIR /app

COPY package.json package-lock.json ./
run npm install

COPY . .

RUN npm run build

CMD ["node", "dist/rooms.js"]