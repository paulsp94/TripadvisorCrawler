import * as selectors from "./selectors";

export const getRestaurantData = async (page) => {
  const name = await page
    .$eval(selectors.nameSelector, (e) => e.innerText)
    .catch(() => undefined);
  const address = await page
    .$eval(selectors.adressSelector, (e) => e.innerText)
    .catch(() => undefined);
  const phone = await page
    .$eval(selectors.phoneSelector, (e) => e.innerText)
    .catch(() => undefined);
  const email = await page
    .$eval(selectors.emailSelector, (e) =>
      e.href.replace("mailto:", "").replace("?subject=?", "")
    )
    .catch(() => undefined);
  const website = await page
    .$x(selectors.websiteXSelector)
    .then((items) => items[0]?.evaluate((e) => e.href));
  const reviews = await page.$eval(selectors.reviewsSelector, (e) =>
    e?.innerText.replace(/\D/g, "")
  );
  const generalStar = await page
    .$x(selectors.generalStarsXSelector)
    .then((items) =>
      items[0]?.$eval(
        selectors.uiBubbleSelector,
        (node) => node.classList[1].replace("bubble_", "") / 10
      )
    );
  const detailStars = await page
    .$x(selectors.starsXSelector)
    .then((items) =>
      items[0]?.$$eval(selectors.uiBubbleSelector, (nodes) =>
        nodes.map((node) => node.classList[1].replace("bubble_", "") / 10)
      )
    );
  const priceRange = await page
    .$x(selectors.priceRangeXSelector)
    .then((items) => items[0]?.evaluate((e) => e.innerText));
  const priceLevel = await page.$eval(
    selectors.priceLevelSelector,
    (node) => node.innerText
  );
  const kitchen = await page
    .$x(selectors.kitchenXSelector)
    .then((items) => items[0]?.evaluate((e) => e.innerText))
    .then((str) => str.split(",").map((item) => item.trim()));
  const city = await page.$$eval(
    selectors.breadcrumbLinkSelector,
    (nodes) =>
      nodes.find((item) => item.getAttribute("onclick").includes("City"))
        .innerText
  );

  await page.waitForSelector(selectors.allLanguages);
  await page.click(selectors.allLanguages);
  await page.waitForSelector(selectors.allLanguagesSelected);

  const ratings = await page
    .$(selectors.ratingDistributionSelector)
    .then((e) =>
      e.$$eval(selectors.ratingItemSelector, (nodes) =>
        nodes.map((node) => node.lastChild.innerText)
      )
    );

  await page.waitForXPath(selectors.allDetailsSelector);
  await page
    .$x(selectors.allDetailsSelector)
    .then((items) => items[0]?.evaluate((e) => e.click()));
  await page.waitForXPath(selectors.detailsSelector);

  const otherDiets = await page
    .$x(selectors.otherDietsXSelector)
    .then((items) => items[0]?.evaluate((e) => e.innerText.split(", ")));
  const description = await page
    .$x(selectors.descriptionXSelector)
    .then((items) => items[0]?.evaluate((e) => e.innerText));
  const meals = await page
    .$x(selectors.mealsXSelector)
    .then((items) => items[0]?.evaluate((e) => e.innerText.split(", ")));
  const otherFunctions = await page
    .$x(selectors.otherFunctionsXSelector)
    .then((items) => items[0]?.evaluate((e) => e.innerText.split(", ")));

  return {
    url: page.url(),
    name,
    description,
    reviews,
    stars: {
      general: generalStar,
      kitchen: detailStars[0],
      service: detailStars[1],
      quality: detailStars[2],
      furnishing: detailStars[3],
    },
    phone,
    address,
    email,
    city,
    zipCode: address.match(/\d{5}/g)[0],
    website,
    kitchen,
    priceRange,
    priceLevel,
    otherDiets,
    meals,
    otherFunctions,
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
