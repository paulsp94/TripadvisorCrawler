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

// const { handleRequests } = require("./utils/interceptors");

process.on("unhandledRejection", (error, p) => {
  console.log("=== UNHANDLED REJECTION ===");
  console.dir(error);
});

// Selectors
const nextButtonSelector = ".nav.next";
const resultSelector = "[data-test-attribute=typeahead-results] > a";
const restaurantLinkSelector = 'a[href^="/Restaurant_"]';

// Results
let errors = [];

const restaurantUrls = fs
  .readFileSync("data/restaurantsListUrls.txt", "utf8")
  .split("\n");
restaurantUrls.pop();

const getRestaurantUrls = (page) =>
  page.$$eval(restaurantLinkSelector, (nodes) =>
    nodes.map((node) => node.href.match(/\/Restaurant_.*.html/g)[0])
  );

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 2,
    monitor: true,
    timeout: 3600 * 1000,
    puppeteer,
    puppeteerOptions: {
      timeout: 300 * 1000,
    },
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    let restaurants = new Set();

    let urls = await getRestaurantUrls(page);
    urls.forEach((url) => restaurants.add(url));

    let nextButtonUrl = await page.$eval(
      nextButtonSelector,
      (node) => node.href
    );

    while (nextButtonUrl) {
      await page.goto(nextButtonUrl);
      urls = await getRestaurantUrls(page);
      urls.forEach((url) => restaurants.add(url));
      nextButtonUrl = await page.$eval(nextButtonSelector, (node) => node.href);
    }

    restaurants = [...restaurants];

    const file = fs.createWriteStream(
      `data/RestaurantsInCities/${url.slice(27, -5)}.txt`
    );
    file.on("error", console.log);
    restaurants.forEach((item) => {
      file.write(item + "\n");
    });
    file.end();
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

  restaurantUrls.forEach((url) => cluster.queue(url));

  await cluster.idle();
  await cluster.close();
})();
