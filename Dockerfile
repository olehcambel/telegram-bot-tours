FROM node:10.16.3-alpine

ENV APP_WORKDIR=/usr/src/app/

COPY package.json package-lock.json $APP_WORKDIR

WORKDIR $APP_WORKDIR

RUN npm run test

COPY .env.example tsconfig.json tsconfig-app.json $APP_WORKDIR
COPY src $APP_WORKDIR/src

RUN npm run compile

RUN rm -rf tsconfig.json tsconfig-app.json src

RUN npm prune --production

EXPOSE 4999

ENTRYPOINT ["node", "build/index.js"]
