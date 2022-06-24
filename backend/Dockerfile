FROM node:18.4.0

WORKDIR /var/app

RUN apt-get update

ADD ./package-lock.json ./package-lock.json
ADD ./package.json ./package.json
ADD ./tsconfig.json ./tsconfig.json

RUN npm ci

ADD ./app.ts ./app.ts
ADD ./src ./src

RUN npm run build

ENTRYPOINT ["node", "app.js"]