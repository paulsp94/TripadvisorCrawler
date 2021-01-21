// import { DateTime } from "luxon";
import { DateTime } from "luxon";
import { getUserData } from "../users/extractor";
import * as selectors from "./selectors";

export const getReviewData = async (page, restaurantId, getUserFromUserId, insertUser) => {
  const languageRegex = /sl=(\w{2})&/;
  const reviewIdRegex = /-(r\d*)-/;
  const formatDate = (dateString, parserFormat) =>
    DateTime.fromFormat(dateString, parserFormat, {
      locale: "de",
    }).toJSDate();

  const baseFrame = await page.$(selectors.base);

  const reviewId = reviewIdRegex.exec(page.url())[1];
  const stars = await page
    .$eval(
      selectors.stars,
      (node) => node.classList[1].replace("bubble_", "") / 10
    )
    .catch(() => undefined);
  const title = await page
    .$eval(selectors.title, (node) => node?.innerText.slice(1, -1))
    .catch(() => undefined);
  const text = await baseFrame
    .$eval(selectors.text, (node) => node?.innerText)
    .catch(() => undefined);
  const language = await baseFrame
    .$eval(selectors.translateButton, (node) => node?.firstChild.dataset.url)
    .catch(() => undefined);
  const reviewDate = await baseFrame
    .$eval(selectors.ratingData, (node) => node?.innerText.slice(9).trim())
    .catch(() => undefined);
  const visitDate = await baseFrame
    .$eval(selectors.visitData, (node) => node?.parentNode.innerText.slice(14))
    .catch(() => undefined);
  const mobile = await baseFrame.$(selectors.mobile).then((node) => !!node);
  const thumbsUp =
    (await baseFrame
      .$eval(selectors.thumbsUp, (node) => parseInt(node?.innerText))
      .catch(() => undefined)) || 0;

  await page.click(selectors.avatar);
  await page.hover(selectors.avatar);
  await page.waitForSelector(selectors.overlay);
  await page.waitForSelector(selectors.profileLink);
  const overlay = await page.$(selectors.overlay);

  const userId = await overlay
    .$eval(
      selectors.profileLink,
      (node) => node.parentNode.href.split("/").slice(-1)[0]
    )
    .catch(() => undefined);
  let user = await getUserFromUserId(userId);
  if (user === null) {
    user = await getUserData(page, userId);
    user = await insertUser(user);
  }

  return {
    restaurantId,
    reviewId,
    stars,
    title,
    text,
    language: (language && languageRegex.exec(language)[1]) || "de",
    reviewDate: reviewDate && formatDate(reviewDate, "DDD"),
    visitDate: visitDate && formatDate(visitDate, "MMMM yyyy"),
    mobile,
    thumbsUp,
    crawled: true,
    postedBy: user._id,
  };
};
