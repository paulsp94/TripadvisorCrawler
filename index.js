const puppeteer = require("puppeteer");
const cliProgress = require("cli-progress");
const fs = require("fs");

const { handleRequests } = require("./utils/interceptors");

// Selectors
const nextButtonSelector = ".nav.next";
const resultSelector = "[data-test-attribute=typeahead-results] > a";
const restaurantLinkSelector = 'a[href^="/Restaurant_"]';

// Results
const results = [];

const restaurantUrls = fs
  .readFileSync("data/restaurantsListUrls.txt", "utf8")
  .split("\n");
restaurantUrls.pop();
console.log(restaurantUrls.length);

const getRestaurantUrls = async (page) =>
  await page.$$eval(restaurantLinkSelector, (nodes) =>
    nodes.map((node) => node.href.match(/\/Restaurant_.*.html/g)[0])
  );

const crawlCity = async (page, url) => {
  const restaurants = new Set();
  await page.goto(url, { waitUntil: "networkidle0" });

  let urls = await getRestaurantUrls(page);
  urls.forEach((url) => restaurants.add(url));

  let nextButtonUrl = await page.$eval(nextButtonSelector, (node) => node.href);
  while (nextButtonUrl) {
    await page.goto(nextButtonUrl);
    urls = await getRestaurantUrls(page);
    urls.forEach((url) => restaurants.add(url));
    nextButtonUrl = await page.$eval(nextButtonSelector, (node) => node.href);
  }

  return restaurants;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", handleRequests);

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(restaurantUrls.length, 0, { city: "" });

  let url = restaurantUrls.pop();
  progressBar.increment({ city: url });
  let restaurants = await crawlCity(page, url);
  results.push(...restaurants);

  while (restaurantUrls.length) {
    url = restaurantUrls.pop();
    progressBar.increment({ city: url });
    restaurants = await crawlCity(page, url);
    results.push(...restaurants);
  }

  console.log(results);
  console.log(results.size);

  progressBar.stop();
  await browser.close();
})();
