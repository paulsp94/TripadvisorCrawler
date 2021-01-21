FROM buildkite/puppeteer

COPY . /crawler
WORKDIR /crawler

RUN npm install
CMD npm start