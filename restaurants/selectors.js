export const nameSelector = 'h1[data-test-target="top-info-header"]';
export const adressSelector = 'a[href="#MAPVIEW"]';
export const phoneSelector = 'a[href^="tel:"]';
export const emailSelector = 'a[href^="mailto:"]';
export const websiteXSelector = '//a[text()="Webseite"]';
export const reviewsSelector = 'a[href="#REVIEWS"] > span';
export const generalStarsXSelector =
  '//h2[text()="Gesamtwertungen und Bewertungen"]/parent::div';
export const starsXSelector = '//div[text()="GESAMTWERTUNGEN"]/parent::*';
export const priceRangeXSelector =
  '//div[text()="PREISSPANNE"]/parent::*/div[last()]';
export const kitchenXSelector = '//div[text()="KÜCHEN"]/parent::*/div[last()]';
export const descriptionXSelector =
  '//div[text()="Beschreibung"]/parent::*/div[last()]';
export const otherDietsXSelector =
  '//div[text()="Andere Ernährungsformen"]/parent::div/div[last()]';
export const mealsXSelector =
  '//div[text()="Mahlzeiten"]/parent::div/div[last()]';
export const otherFunctionsXSelector =
  '//div[text()="FUNKTIONEN"]/parent::div/div[last()]';
export const ratingDistributionSelector = 'div[data-param="trating"]';
export const ratingItemSelector = ".item";
export const allLanguages =
  ".content > .choices #filters_detail_language_filterLang_ALL";
export const allLanguagesSelected =
  '.content > .choices #filters_detail_language_filterLang_ALL[checked="checked"]';

export const uiBubbleSelector = ".ui_bubble_rating";
export const breadcrumbLinkSelector = ".breadcrumb > a";

export const allDetailsSelector = '//a[text()="Alle Details anzeigen"]';
export const detailsSelector = '//div[text()="Details"]';
