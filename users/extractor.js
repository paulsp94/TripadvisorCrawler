import { DateTime } from "luxon";
import * as selectors from "./selectors";

export const getUserData = async (page, userId) => {
  await page.waitForSelector(selectors.level);
  const name = await page.$eval(selectors.name, (node) => node.innerText);
  const level = await page
    .$eval(selectors.level, (node) => node.innerText)
    .catch(() => undefined);
  const thumbsUp = await page
    .$x(selectors.thumbsUp)
    .then((items) =>
      items[0]?.evaluate((node) => node.innerText.replace(/\D/g, ""))
    );
  const ratings = await page
    .$x(selectors.ratings)
    .then((items) =>
      items[0]?.evaluate((node) => node.innerText.replace(/\D/g, ""))
    );
  const visitedTowns = await page
    .$x(selectors.visitedTowns)
    .then((items) =>
      items[0]?.evaluate((node) => node.innerText.replace(/\D/g, ""))
    );
  const images = await page
    .$x(selectors.images)
    .then((items) =>
      items[0]?.evaluate((node) => node.innerText.replace(/\D/g, ""))
    );
  const memberSince = await page
    .$eval(selectors.memberSince, (node) =>
      node.innerText.replace("Tripadvisor-Mitglied seit ", "")
    )
    .catch(() => undefined);
  const personalInfo = await page
    .$eval(selectors.personalInfo, (node) => node.innerText)
    .catch(() => undefined);
  let homeTown = undefined;
  let age = undefined;
  let sex = undefined;
  if (personalInfo) {
    if (personalInfo.startsWith("Aus ")) {
      homeTown = personalInfo.replace("Aus ", "");
    } else {
      const infos = personalInfo.split(" aus ");
      homeTown = infos[1];
      [sex, age] = infos[0].split(" ");
    }
  }
  const ratingDistribution = await page.$$eval(selectors.ratingItems, (nodes) =>
    nodes.map((node) => node.innerText)
  );

  return {
    name,
    userId,
    ratings,
    thumbsUp,
    visitedTowns,
    images,
    level,
    memberSince: DateTime.fromISO(memberSince).toJSDate(),
    homeTown,
    age,
    sex,
    ratingDistribution: {
      excellent: ratingDistribution[0],
      verygood: ratingDistribution[1],
      good: ratingDistribution[2],
      fair: ratingDistribution[3],
      poor: ratingDistribution[4],
    },
    crawled: true,
  };
};
