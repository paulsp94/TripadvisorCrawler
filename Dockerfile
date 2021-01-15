FROM zenika/alpine-chrome:with-puppeteer

RUN mkdir /usr/src/app/crawler
WORKDIR /usr/src/app/crawler
COPY --chown=chrome:chrome package.json .
RUN npm install
COPY --chown=chrome:chrome . .

CMD npm start