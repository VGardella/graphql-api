FROM node:lts-alpine
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn install
EXPOSE 3000
CMD ["node", "index.js"]