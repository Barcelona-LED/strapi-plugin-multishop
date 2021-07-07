'use strict';

const { isScalarAttribute } = require('strapi-utils').contentTypes;
const { pick, prop, map, intersection, isEmpty, orderBy, pipe, every } = require('lodash/fp');
const { getService } = require('../../../../utils');

const shouldBeProcessed = processedShopCodes => entry => {
  return (
    entry.stores.length > 0 &&
    intersection(entry.stores.map(prop('shop')), processedShopCodes).length === 0
  );
};

const getUpdatesInfo = ({ entriesToProcess, attributesToMigrate }) => {
  const updates = [];
  for (const entry of entriesToProcess) {
    const attributesValues = pick(attributesToMigrate, entry);
    const entriesIdsToUpdate = entry.stores.map(prop('id'));
    updates.push({ entriesIdsToUpdate, attributesValues });
  }
  return updates;
};

const getSortedShops = async ({ transacting } = {}) => {
  const shopService = getService('shops');

  let defaultShop;
  try {
    const storeRes = await strapi
      .query('core_store')
      .findOne({ key: 'plugin_multishop_default_shop' }, null, { transacting });
    defaultShop = JSON.parse(storeRes.value);
  } catch (e) {
    throw new Error("Could not migrate because the default shop doesn't exist");
  }

  const shops = await shopService.find({}, null, { transacting });
  if (isEmpty(shops)) {
    throw new Error('Could not migrate because no shop exist');
  }

  // Put default shop first
  return pipe(
    map(shop => ({ code: shop.code, isDefault: shop.code === defaultShop })),
    orderBy(['isDefault', 'code'], ['desc', 'asc']),
    map(prop('code'))
  )(shops);
};

const areScalarAttributesOnly = ({ model, attributes }) =>
  pipe(pick(attributes), every(isScalarAttribute))(model.attributes);

module.exports = {
  shouldBeProcessed,
  getUpdatesInfo,
  getSortedShops,
  areScalarAttributesOnly,
};
