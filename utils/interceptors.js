const blockedResourceTypes = [
  "image",
  "media",
  "font",
  "texttrack",
  "object",
  "beacon",
  "csp_report",
  "imageset",
];

const skippedResources = [
  "quantserve",
  "adzerk",
  "doubleclick",
  "adition",
  "exelator",
  "sharethrough",
  "cdn.api.twitter",
  "google-analytics",
  "googletagmanager",
  "google",
  "fontawesome",
  "facebook",
  "analytics",
  "optimizely",
  "clicktale",
  "mixpanel",
  "zedo",
  "clicksor",
  "tiqcdn",
];

exports.handleRequests = (interceptedRequest) => {
  const requestUrl = interceptedRequest._url.split("?")[0].split("#")[0];
  if (
    blockedResourceTypes.indexOf(interceptedRequest.resourceType()) !== -1 ||
    skippedResources.some((resource) => requestUrl.indexOf(resource) !== -1)
  ) {
    interceptedRequest.abort();
  } else {
    interceptedRequest.continue();
  }
};
