export const name = 'h1[data-test-target="top-info-header"]';
export const adress = 'a[href="#MAPVIEW"]';
export const phone = 'a[href^="tel:"]';
export const email = 'a[href^="mailto:"]';
export const websiteX = '//a[text()="Webseite"]';
export const reviews = 'a[href="#REVIEWS"] > span';
export const generalStarsX =
  '//h2[text()="Gesamtwertungen und Bewertungen"]/parent::div';
export const starsX = '//div[text()="GESAMTWERTUNGEN"]/parent::*';
export const priceRangeX = '//div[text()="PREISSPANNE"]/parent::*/div[last()]';
export const priceLevel =
  'div[data-test-target="restaurant-detail-info"]>div:nth-child(2)>span:nth-child(3)>a:first-child';
export const kitchenX = '//div[text()="KÜCHEN"]/parent::*/div[last()]';
export const descriptionX =
  '//div[text()="Beschreibung"]/parent::*/div[last()]';
export const otherDietsX =
  '//div[text()="Andere Ernährungsformen"]/parent::div/div[last()]';
export const mealsX = '//div[text()="Mahlzeiten"]/parent::div/div[last()]';
export const otherFunctionsX =
  '//div[text()="FUNKTIONEN"]/parent::div/div[last()]';
export const ratingDistribution = 'div[data-param="trating"]';
export const ratingItem = ".item";
export const allLanguages =
  ".content > .choices #filters_detail_language_filterLang_ALL";
export const allLanguagesSelected =
  '.content > .choices #filters_detail_language_filterLang_ALL[checked="checked"]';

export const uiBubble = ".ui_bubble_rating";
export const breadcrumbLink = ".breadcrumb > a";

export const allDetails = '//a[text()="Alle Details anzeigen"]';
export const details = '//div[text()="Details"]';
