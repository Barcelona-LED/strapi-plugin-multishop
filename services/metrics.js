'use strict';

const { reduce } = require('lodash/fp');
const { getService } = require('../utils');

const sendDidInitializeEvent = async () => {
  const { isShopEnabledContentType } = getService('content-types');

  const numberOfContentTypes = reduce(
    (sum, contentType) => (isShopEnabledContentType(contentType) ? sum + 1 : sum),
    0
  )(strapi.contentTypes);

  await strapi.telemetry.send('didInitializeMultishop', { numberOfContentTypes });
};

const sendDidUpdateMultishopShopsEvent = async () => {
  const numberOfShops = await getService('shops').count();

  await strapi.telemetry.send('didUpdateMultishopShops', { numberOfShops });
};

module.exports = {
  sendDidInitializeEvent,
  sendDidUpdateMultishopShopsEvent,
};
