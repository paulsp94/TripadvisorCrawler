const puppeteer = require("puppeteer");
const fs = require("fs");

const { handleRequests } = require("./utils/interceptors");

const wikiCities =
  "https://de.wikipedia.org/wiki/Liste_der_kreisfreien_St%C3%A4dte_in_Deutschland";

const selector =
  "#mw-content-text > div.mw-parser-output > table.wikitable.sortable.zebra.jquery-tablesorter > tbody > tr > td:nth-child(2) > a";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", handleRequests);

  await page.goto(wikiCities, { waitUntil: "networkidle0" });
  const cities = await page.$$eval(selector, (nodes) =>
    nodes.map((node) => node.innerText)
  );

  const file = fs.createWriteStream("data/kreisstaedte.txt");
  file.on("error", console.log);
  cities.forEach((item) => {
    file.write(item + "\n");
  });
  file.end();

  await browser.close();
})();
