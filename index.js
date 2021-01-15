import puppeteer from "puppeteer-extra";

import { enchantPuppeteer } from "enchant-puppeteer";
enchantPuppeteer();

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
const adblocker = AdblockerPlugin({
  blockTrackers: true,
});
puppeteer.use(adblocker);

import blockResourcesPlugin from "puppeteer-extra-plugin-block-resources";
const ressourceBlocker = blockResourcesPlugin({
  blockedTypes: new Set(["image", "stylesheet"]),
});
puppeteer.use(ressourceBlocker);

import { Cluster } from "puppeteer-cluster";

import fs from "fs";

import { initDatabase } from "./database/mongoConnector";
import { getRestaurantData } from "./restaurants/extractor";
import { getReviewData } from "./reviews/extractor";

process.on("unhandledRejection", (error, p) => {
  console.log("=== UNHANDLED REJECTION ===");
  console.dir(error);
});

const baseURL = "https://www.tripadvisor.de/";
const nextButtonSelector = ".nav.next";
const reviewLinkSelector = 'a[href^="/ShowUserReview"]';
export const allLanguages =
  ".content > .choices #filters_detail_language_filterLang_ALL";
export const allLanguagesSelected =
  '.content > .choices #filters_detail_language_filterLang_ALL[checked="checked"]';

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 4,
    monitor: true,
    timeout: 3600 * 2000,
    puppeteer,
    puppeteerOptions: {
      timeout: 600 * 1000,
      args: ["--disable-dev-shm-usage"],
    },
  });

  const errors = {};

  const checkIfErrorUrlSuccessful = (item) => {
    if (item.url in Object.keys(errors)) {
      delete errors[item.url];
    }
  };

  const {
    getAllUncrawledRestaurant,
    updateRestaurant,
    insertManyReviews,
    updateReview,
    getAllUncrawledReviews,
  } = await initDatabase();

  const crawlRestaurant = async ({ page, data: restaurant }) => {
    await page.goto(restaurant.url);

    const restaurantData = await getRestaurantData(page);

    let reviews = new Set();
    let newReviews = await page.$$eval(reviewLinkSelector, (nodes) =>
      nodes.map((node) => node.href)
    );
    newReviews.forEach((url) =>
      reviews.add({ url: url, restaurantId: restaurant._id })
    );

    if (restaurantData.reviews > 10) {
      await page.waitForSelector(allLanguages);
      await page.click(allLanguages);
      await page.waitForSelector(allLanguagesSelected);

      await page.waitForSelector(nextButtonSelector);
      let nextButtonUrl = await page.$eval(
        nextButtonSelector,
        (node) => node.href
      );

      while (nextButtonUrl) {
        await page.goto(nextButtonUrl);
        newReviews = await page.$$eval(reviewLinkSelector, (nodes) =>
          nodes.map((node) => node.href)
        );
        newReviews.forEach((url) =>
          reviews.add({ url: url, restaurantId: restaurant._id })
        );
        await page.waitForSelector(nextButtonSelector);
        nextButtonUrl = await page.$eval(
          nextButtonSelector,
          (node) => node.href
        );
      }
    }

    reviews = [...reviews].map((item) => ({
      url: baseURL + item.url,
      ...item,
    }));

    const createdReviews = await insertManyReviews(reviews);
    createdReviews.forEach((item) => cluster.queue(item, crawlReview));
    await updateRestaurant(restaurant._id, restaurantData);
    checkIfErrorUrlSuccessful(restaurant);
  };

  const crawlReview = async ({ page, data: review }) => {
    await page.goto(review.url);
    const reviewData = await getReviewData(page, review._id);
    await updateReview(review._id, reviewData);
    checkIfErrorUrlSuccessful(review);
  };

  cluster.on("taskerror", (err, data, willRetry) => {
    if (willRetry) {
      console.warn(
        `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
      );
      if (errors[data.url]) {
        errors[data.url].append(err.message);
      } else {
        errors[data.url] = [err.message];
      }
    } else {
      console.error(`Failed to crawl ${data}: ${err}`);
    }
  });

  const uncrawledRestaurants = await getAllUncrawledRestaurant();
  uncrawledRestaurants.forEach((item) => cluster.queue(item, crawlRestaurant));
  const uncrawledReviews = await getAllUncrawledReviews();
  uncrawledReviews.forEach((item) => cluster.queue(item, crawlReview));

  let data = JSON.stringify(errors);
  fs.writeFileSync("data/crawlerErrors.json", data);

  await cluster.idle();
  await cluster.close();
})();
