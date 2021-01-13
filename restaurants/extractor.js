import * as selectors from "./selectors";

export const getRestaurantData = async (page) => {
  const restaurantIdRegex = /-(d\d*)-/;

  const restaurantId = restaurantIdRegex.exec(page.url())[1];
  const name = await page
    .$eval(selectors.name, (e) => e.innerText)
    .catch(() => undefined);
  const address = await page
    .$eval(selectors.adress, (e) => e.innerText)
    .catch(() => undefined);
  const phone = await page
    .$eval(selectors.phone, (e) => e.innerText)
    .catch(() => undefined);
  const email = await page
    .$eval(selectors.email, (e) =>
      e.href.replace("mailto:", "").replace("?subject=?", "")
    )
    .catch(() => undefined);
  const website = await page
    .$x(selectors.websiteX)
    .then((items) => items[0]?.evaluate((e) => e.href));
  const reviews = await page
    .$eval(selectors.reviews, (e) => e.innerText.replace(/\D/g, ""))
    .catch(() => undefined);
  const generalStar = await page
    .$x(selectors.generalStarsX)
    .then((items) =>
      items[0]
        ?.$eval(
          selectors.uiBubble,
          (node) => node?.classList[1].replace("bubble_", "") / 10
        )
        .catch(() => undefined)
    );
  const detailStars = await page
    .$x(selectors.starsX)
    .then((items) =>
      items[0]?.$$eval(selectors.uiBubble, (nodes) =>
        nodes.map((node) => node.classList[1].replace("bubble_", "") / 10)
      )
    );
  const priceRange = await page
    .$x(selectors.priceRangeX)
    .then((items) => items[0]?.evaluate((e) => e.innerText));
  const priceLevel = await page
    .$eval(selectors.priceLevel, (node) => node.innerText)
    .catch(() => undefined);
  const kitchen = await page
    .$x(selectors.kitchenX)
    .then((items) => items[0]?.evaluate((e) => e.innerText))
    .then((str) => str?.split(",").map((item) => item.trim()));
  const city = await page.$$eval(
    selectors.breadcrumbLink,
    (nodes) =>
      nodes.find((item) => item.getAttribute("onclick").includes("City"))
        .innerText
  );

  await page.waitForSelector(selectors.allLanguages);
  await page.click(selectors.allLanguages);
  await page.waitForSelector(selectors.allLanguagesSelected);

  const ratings = await page
    .$(selectors.ratingDistribution)
    .then((e) =>
      e.$$eval(selectors.ratingItem, (nodes) =>
        nodes.map((node) => node.lastChild.innerText)
      )
    );

  await page.waitForXPath(selectors.allDetails);
  await page
    .$x(selectors.allDetails)
    .then((items) => items[0]?.evaluate((e) => e.click()));
  await page.waitForXPath(selectors.details);

  const otherDiets = await page
    .$x(selectors.otherDietsX)
    .then((items) => items[0]?.evaluate((e) => e.innerText.split(", ")));
  const description = await page
    .$x(selectors.descriptionX)
    .then((items) => items[0]?.evaluate((e) => e.innerText));
  const meals = await page
    .$x(selectors.mealsX)
    .then((items) => items[0]?.evaluate((e) => e.innerText.split(", ")));
  const otherFunctions = await page
    .$x(selectors.otherFunctionsX)
    .then((items) => items[0]?.evaluate((e) => e.innerText.split(", ")));

  return {
    url: page.url(),
    restaurantId,
    name,
    description,
    reviews,
    stars: {
      general: generalStar,
      kitchen: detailStars && detailStars[0],
      service: detailStars && detailStars[1],
      quality: detailStars && detailStars[2],
      furnishing: detailStars && detailStars[3],
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
      excellent: ratings && ratings[0],
      verygood: ratings && ratings[1],
      good: ratings && ratings[2],
      fair: ratings && ratings[3],
      poor: ratings && ratings[4],
    },
    crawled: true,
  };
};
