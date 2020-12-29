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

const { initDatabase } = require("./database/mongoConnector");

process.on("unhandledRejection", (error, p) => {
  console.log("=== UNHANDLED REJECTION ===");
  console.dir(error);
});

// Selectors
const nextButtonSelector = ".nav.next";

const nameSelector = '[data-test-target="top-info-header"]';
const adressSelector = 'a[href="#MAPVIEW"]';
const phoneSelector = 'a[href^="tel:"]';
const emailSelector = 'a[href^="mailto:"]';
const websiteSelector = '//a[text()="Webseite"]';
const reviewsSelector = 'a[href="#REVIEWS"]';
const starsSelector = '//div[text()="GESAMTWERTUNGEN"]';
const priceRangeSelector = '//div[text()="PREISSPANNE"]';
const kitchenSelector = '//div[text()="KÜCHEN"]';
const descriptionSelector = '//div[text()="Beschreibung"]';
const otherDietsSelector = '//div[text()="ANDERE ERNÄHRUNGSFORMEN"]';
const mealsSelector = '//div[text()="MAHLZEITEN"]';
const otherFunctionsSelector = '//div[text()="FUNKTIONEN"]';
const ratingDistributionSelector = 'div[data-param="trating"]';

const allDetailsSelector = '//a[text()="Alle Details anzeigen"]';

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 2,
    monitor: true,
    timeout: 3600 * 2000,
    puppeteer,
    puppeteerOptions: {
      timeout: 600 * 1000,
      args: ["--disable-dev-shm-usage"],
    },
  });

  const { insertManyRestaurants } = await initDatabase();

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

    restaurants = [...restaurants].map((item) => ({
      url: baseURL + item,
    }));

    insertManyRestaurants(restaurants);
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
