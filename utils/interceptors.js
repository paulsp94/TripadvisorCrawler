exports.handleRequests = (interceptedRequest) => {
  const url = interceptedRequest.url();
  if (
    interceptedRequest.resourceType() === "stylesheet" ||
    interceptedRequest.resourceType() === "font" ||
    interceptedRequest.resourceType() === "image"
  ) {
    interceptedRequest.abort();
  } else {
    interceptedRequest.continue();
  }
};
