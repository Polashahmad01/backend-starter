FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY ./src ./src
COPY ./config ./config

ENV NODE_ENV=development \
  ALLOWED_ORIGINS=http://localhost:3000,*,undefined,http://localhost:5173,https://frontend-starter-bjn.pages.dev

CMD [ "node", "src/app.js" ]
