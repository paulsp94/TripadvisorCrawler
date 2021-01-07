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

const reviewSelector = ".reviewSelector";

const reviewStartsSelector = ".ui_bubble_rating";
const reviewTitleSelector = ".noQuotes";
const reviewTranslateButtonSelector =
  ".prw_reviews_google_translate_button_hsx";
const reviewTextSelector = ".entry";
const reviewRatingDataSelector = ".ratingDate";
const reviewVisitDataSelector = ".stay_date_label";
const reviewMobileSelector = ".viaMobile";
const reviewThumbsUpSelector = ".numHelp.emphasizeWithColor";

const nameSelector = 'h1[data-test-target="top-info-header"]';
const adressSelector = 'a[href="#MAPVIEW"]';
const phoneSelector = 'a[href^="tel:"]';
const emailSelector = 'a[href^="mailto:"]';
const websiteXSelector = '//a[text()="Webseite"]';
const reviewsSelector = 'a[href="#REVIEWS"] > span';
const generalStarsXSelector = '//div[text()="GESAMTWERTUNGEN"]';
const starsXSelector = '//div[text()="GESAMTWERTUNGEN"]';
const priceRangeXSelector = '//div[text()="PREISSPANNE"]';
const kitchenXSelector = '//div[text()="KÜCHEN"]';
const descriptionXSelector = '//div[text()="Beschreibung"]';
const otherDietsXSelector = '//div[text()="ANDERE ERNÄHRUNGSFORMEN"]';
const mealsXSelector = '//div[text()="MAHLZEITEN"]';
const otherFunctionsXSelector = '//div[text()="FUNKTIONEN"]';
const ratingDistributionSelector = 'div[data-param="trating"]';
const ratingItemSelector = ".item";
const allLanguages =
  ".content > .choices #filters_detail_language_filterLang_ALL";
const allLanguagesSelected =
  '.content > .choices #filters_detail_language_filterLang_ALL[checked="checked"]';

const allDetailsSelector = '//a[text()="Alle Details anzeigen"]';

const getRestaurantData = async (page) => {
  const name = await page.$eval(nameSelector, (e) => e.innerHTML);
  const address = await page.$eval(adressSelector, (e) => e.innerHTML);
  const phone = await page.$eval(phoneSelector, (e) => e.innerHTML);
  const email = await page.$eval(emailSelector, (e) =>
    e.href.replace("mailto:", "").replace("?subject=?", "")
  );
  const website = await page
    .$x(websiteXSelector)
    .then((items) => items[0].evaluate((e) => e.href));
  const reviews = await page.$eval(reviewsSelector, (e) =>
    e.innerText.replace(/\D/g, "")
  );
  // const stars = await page
  //   .$x(starsXSelector)
  //   .then((node) => node[0].evaluate((item) => item.innerHTML));
  const priceRange = await page
    .$x(priceRangeXSelector)
    .then((items) =>
      items[0].evaluate((e) => e.parentNode.lastChild.innerText)
    );
  const kitchen = await page
    .$x(kitchenXSelector)
    .then((items) => items[0].evaluate((e) => e.parentNode.lastChild.innerText))
    .then((str) => str.split(",").map((item) => item.trim()));
  // const description = await page
  //   .$x(descriptionXSelector)
  //   .then((items) => items[0].evaluate((e) => e.innerText));
  // const otherDiets = await page
  //   .$x(otherDietsXSelector)
  //   .then((items) => items[0].evaluate((e) => e.innerText));
  // const meals = await page
  //   .$x(mealsXSelector)
  //   .then((items) => items[0].evaluate((e) => e.innerText));
  // const otherFunctions = await page
  //   .$x(otherFunctionsXSelector)
  //   .then((items) => items[0].evaluate((e) => e.innerText));

  await page.waitForSelector(allLanguages);
  await page.click(allLanguages);
  await page.waitForSelector(allLanguagesSelected);

  const ratings = await page
    .$(ratingDistributionSelector)
    .then((e) =>
      e.$$eval(ratingItemSelector, (nodes) =>
        nodes.map((node) => node.lastChild.innerHTML)
      )
    );

  console.log(address);
  console.log(
    address.trim().split(",").slice(-1)[0].replace(" Deutschland", "")
  );

  return {
    url: page.url(),
    name,
    // description,
    reviews,
    // stars: {
    //   general: Number,
    //   kitchen: Number,
    //   service: Number,
    //   quality: Number,
    //   general: Number,
    // },
    phone,
    address,
    email,
    city: address.trim().split(",").slice(-1)[0].replace(" Deutschland", ""),
    zipCode: address.match(/\d{5}/g)[0],
    website,
    kitchen,
    priceRange,
    // otherDiets,
    // meals: [String],
    // otherFunctions: [String],
    ratingDistribution: {
      excellent: ratings[0],
      verygood: ratings[1],
      good: ratings[2],
      fair: ratings[3],
      poor: ratings[4],
    },
    crawled: true,
  };
};

const getReviews = (page, id) =>
  page.$$eval(reviewLinkSelector, (nodes) =>
    nodes.map((node) => extractReviewInfo(node, id))
  );

const getReviewData = async (element, id) => {
  const languageRegex = /sl=(\w{2})&/;

  const reviewId = element.dataset.reviewid;
  const stars = await element.$eval(
    reviewStartsSelector,
    (node) => node.getAttribute("alt")[0]
  );
  const title = await element.$eval(
    reviewTitleSelector,
    (node) => node.innerHTML
  );
  const text = await element.$eval(
    reviewTextSelector,
    (node) => node.innerText
  );
  const language =
    (await element.$eval(
      reviewTranslateButtonSelector,
      (node) => languageRegex.exec(node.firstChild.dataset.url)[0]
    )) || "de";
  const reviewDate = await element.$eval(ratingDate, (node) =>
    Date.parse(node.title)
  );
  const visitDate = await element.$eval(reviewVisitDataSelector, (node) =>
    Date.parse(node.parentElement.innerText.slice(14))
  );
  const mobile = await element.$(reviewMobileSelector);
  const thumbsUp = await element.$eval(reviewThumbsUpSelector, (node) =>
    node.innerHTML.trim()
  );

  const user = getUserFromUserId(userId);

  return {
    restaurantId: id,
    reviewId,
    stars,
    title,
    text,
    language,
    reviewDate,
    visitDate,
    mobile: !!mobile,
    thumbsUp,
    // postedBy: { type: ObjectId, ref: "User" },
  };
};

const getUserData = async (page) => {};

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
  } = await initDatabase();

  const crawlRestaurant = await cluster.task(
    async ({ page, data: restaurant }) => {
      await page.goto(restaurant.url);

      const restaurantData = await getRestaurantData(page);
      await updateRestaurant(restaurant._id, restaurantData);
      checkIfErrorUrlSuccessful(restaurant);

      const reviews = Set();

      let newReviews = await getReviews(page, restaurant._id);

      let nextButtonUrl = await page.$eval(
        nextButtonSelector,
        (node) => node.href
      );

      while (nextButtonUrl) {
        await page.goto(nextButtonUrl);
        urls = await getRestaurantUrls(page);
        urls.forEach((url) => restaurants.add(url));
        nextButtonUrl = await page.$eval(
          nextButtonSelector,
          (node) => node.href
        );
      }

      restaurants = [...restaurants].map((item) => ({
        url: baseURL + item,
      }));

      reviews = [...reviews];
      insertManyReviews(reviews);
    }
  );

  const crawlReview = await cluster.task(async ({ page, data: review }) => {
    await page.goto(review.url);

    const reviewData = await getReviewData(page, review.restaurantId);
    await updateReview(review._id, reviewData);
    checkIfErrorUrlSuccessful(review);
  });

  const crawlUser = await cluster.task(async ({ page, data: user }) => {
    await page.goto(user.url);

    const userData = await getUserData(page);
    await updateUser(user._id, userData);
    checkIfErrorUrlSuccessful(user);
  });

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
      console.error(`Failed to crawl ${data}: ${err.message}`);
    }
  });

  const uncrawled = await getAllUncrawledRestaurant();
  uncrawled.forEach((item) => cluster.queue(item, crawlRestaurant));

  let data = JSON.stringify(errors);
  fs.writeFileSync("data/crawlerErrors.json", data);

  await cluster.idle();
  await cluster.close();
})();
