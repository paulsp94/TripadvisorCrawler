const puppeteer = require("puppeteer");
const fs = require("fs");

const { handleRequests } = require("./utils/interceptors");

// Selectors
const restaurantsSectionLinkSelector = "a[title=Restaurants]";

// Results
let cityRestaurantsUrls = [];

const urls = fs.readFileSync("data/tourismUrls.txt", "utf8").split("\n");
urls.pop();
console.log(urls.length);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", handleRequests);

  let url = urls.pop();
  await page.goto(url);
  let restaurantsUrl = await page.$eval(
    restaurantsSectionLinkSelector,
    (node) => node.href
  );
  cityRestaurantsUrls.push(restaurantsUrl);

  while (urls.length) {
    url = urls.pop();
    await page.goto(url);
    restaurantsUrl = await page.$eval(
      restaurantsSectionLinkSelector,
      (node) => node.href
    );
    cityRestaurantsUrls.push(restaurantsUrl);
  }

  console.log(cityRestaurantsUrls.length);
  console.log(cityRestaurantsUrls);

  const file = fs.createWriteStream("data/restaurantsListUrls.txt");
  file.on("error", console.log);
  cityRestaurantsUrls.forEach((item) => {
    file.write(item + "\n");
  });
  file.end();

  await browser.close();
})();
