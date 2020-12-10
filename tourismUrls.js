const puppeteer = require("puppeteer");
const fs = require("fs");

const { handleRequests } = require("./utils/interceptors");

// Selectors
const heroSearchSelector =
  "[data-test-attribute=typeahead-SINGLE_SEARCH_HERO] > form > [type=search]";
const cityTourismSelector = 'a[href^="/Tourism"]';

// Urls
const baseUrl = "https://www.tripadvisor.de/";

// Results
let cityUrls = [];

const cities = fs.readFileSync("data/kreisstaedte.txt", "utf8").split("\n");
cities.pop();

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", handleRequests);

  await page.goto(baseUrl, { waitUntil: "networkidle0" });

  let query = cities.pop();
  await page.type(heroSearchSelector, query);
  await page.waitForTimeout(1000);
  let url = await page.$eval(cityTourismSelector, (node) => node.href);
  cityUrls.push(url);

  while (cities.length) {
    query = cities.pop();
    await page.click(heroSearchSelector, { clickCount: 3 });
    await page.type(heroSearchSelector, query);
    await page.waitForTimeout(1000);
    url = await page.$eval(cityTourismSelector, (node) => node.href);
    cityUrls.push(url);
  }

  const file = fs.createWriteStream("data/tourismUrls.txt");
  file.on("error", console.log);
  cityUrls.forEach((item) => {
    file.write(item + "\n");
  });
  file.end();

  await browser.close();
})();
