const puppeteer = require("puppeteer-extra");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const adblocker = AdblockerPlugin({
  blockTrackers: true,
});
puppeteer.use(adblocker);

const { Cluster } = require("puppeteer-cluster");

const fs = require("fs");

// Selectors
const heroSearchSelector =
  "[data-test-attribute=typeahead-SINGLE_SEARCH_HERO] > form > [type=search]";
const cityRestaurantSelector = 'a[href^="/Restaurants-g"]';

// Urls
const baseUrl = "https://www.tripadvisor.de/";

// Results
let cityRestaurantsUrls = new Set();

const cities = fs.readFileSync("data/kreisstaedte.txt", "utf8").split("\n");
cities.pop();

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 5,
    monitor: true,
    // timeout: 3600 * 1000,
    puppeteer,
    puppeteerOptions: {
      headless: true,
      // timeout: 300 * 1000,
    },
  });

  await cluster.task(async ({ page, data: city }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle0" });

    await page.type(heroSearchSelector, `${city} restaurants`);
    await page.waitForTimeout(2000);
    const restaurantUrls = await page.$$eval(cityRestaurantSelector, (nodes) =>
      nodes.map((node) => node.href)
    );
    const url = restaurantUrls.sort((a, b) => b.length - a.length)[0];

    const lenBefore = cityRestaurantsUrls.size;
    cityRestaurantsUrls.add(url);
    if (lenBefore === cityRestaurantsUrls.size) {
      console.log(`Found nothing new for ${city}. Got url ${url}.`);
      await page.screenshot({
        path: `./data/errors/${city}.png`,
        type: "png",
        fullPage: true,
      });
    }
  });

  cluster.on("taskerror", (err, data, willRetry) => {
    if (willRetry) {
      console.warn(
        `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
      );
    } else {
      console.error(`Failed to crawl ${data}: ${err.message}`);
    }
  });

  cities.forEach((city) => cluster.queue(city));

  await cluster.idle();
  await cluster.close();

  const file = fs.createWriteStream("data/restaurantsListUrls.txt");
  file.on("error", console.log);
  cityRestaurantsUrls.forEach((item) => {
    file.write(item + "\n");
  });
  file.end();
})();
