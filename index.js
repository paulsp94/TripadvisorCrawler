const puppeteer = require("puppeteer");
const cliProgress = require("cli-progress");
const fs = require("fs");

const { handleRequests } = require("./utils/interceptors");
const { error } = require("console");

// Selectors
const nextButtonSelector = ".nav.next";
const resultSelector = "[data-test-attribute=typeahead-results] > a";
const restaurantLinkSelector = 'a[href^="/Restaurant_"]';

// Results
const results = [];
let errors = [];

const restaurantUrls = fs
  .readFileSync("data/restaurantsListUrls.txt", "utf8")
  .split("\n");
restaurantUrls.pop();
console.log(restaurantUrls.length);

const getRestaurantUrls = (page) =>
  page.$$eval(restaurantLinkSelector, (nodes) =>
    nodes.map((node) => node.href.match(/\/Restaurant_.*.html/g)[0])
  );

const crawlCity = async (page, url) => {
  const restaurants = new Set();
  await page
    .goto(url, { waitUntil: "networkidle0" })
    .catch((error) => errors.push({ city: url, error, id: 31 }));

  let urls = await getRestaurantUrls(page).catch((error) =>
    errors.push({ city: url, error, id: 34 })
  );
  urls.forEach((url) => restaurants.add(url));

  let nextButtonUrl = await page
    .$eval(nextButtonSelector, (node) => node.href)
    .catch((error) => errors.push({ city: url, error, id: 40 }));
  while (nextButtonUrl) {
    await page
      .goto(nextButtonUrl)
      .catch((error) => errors.push({ city: url, error }));
    urls = await getRestaurantUrls(page).catch((error) =>
      errors.push({ city: url, error, id: 46 })
    );
    urls.forEach((url) => restaurants.add(url));
    nextButtonUrl = await page
      .$eval(nextButtonSelector, (node) => node.href)
      .catch((error) => errors.push({ city: url, error, id: 51 }));
  }

  return restaurants;
};

(async () => {
  let browser = null;
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint:
        "ws://localhost:3000" +
        "?--window-size=1920x1080" +
        "&--no-sandbox=true" +
        "&--shm-size=3gb" +
        "&--disable-setuid-sandbox=true" +
        "&--disable-dev-shm-usage=true" +
        "&--disable-accelerated-2d-canvas=true" +
        "&--disable-gpu=true",
    });
    let page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", handleRequests);

    progressBar.start(restaurantUrls.length, 0);

    let url = restaurantUrls.pop();
    progressBar.increment();
    let restaurants = await crawlCity(page, url).catch((error) => {
      errors.push({ city: url, error, id: 82 });
      return false;
    });
    restaurants && results.push(...restaurants);

    while (restaurantUrls.length) {
      try {
        url = restaurantUrls.pop();
        progressBar.increment();
        restaurants = await crawlCity(page, url).catch((error) => {
          errors.push({ city: url, error, id: 91 });
          return false;
        });
        restaurants && results.push(...restaurants);
      } catch (err) {
        console.log("While catch");
        restaurantUrls.push(url);
        browser = await puppeteer.connect({
          browserWSEndpoint:
            "ws://localhost:3000" +
            "?--window-size=1920x1080" +
            "&--no-sandbox=true" +
            "&--shm-size=3gb" +
            "&--disable-setuid-sandbox=true" +
            "&--disable-dev-shm-usage=true" +
            "&--disable-accelerated-2d-canvas=true" +
            "&--disable-gpu=true",
        });
        let page = await browser.newPage();
      }
    }

    // console.log(results);
    console.log(results.size);

    const file = fs.createWriteStream("data/restaurantUrls.txt");
    file.on("error", console.log);
    results.forEach((item) => {
      file.write(item + "\n");
    });
    file.end();

    errors = errors.map((item) => ({ ...item, error: item.error.toString() }));
    fs.writeFile("data/errors.json", JSON.stringify(errors, null, 4), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("JSON saved to data/errors.json");
      }
    });
  } catch (err) {
    console.log(err);
  } finally {
    progressBar && progressBar.stop();
    browser && browser.close();
  }
})();
