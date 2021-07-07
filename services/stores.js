'use strict';

const { prop, isNil, isEmpty } = require('lodash/fp');

const { getService } = require('../utils');

/**
 * Adds the default shop to an object if it isn't defined yet
 * @param {Object} data a data object before being persisted into db
 */
const assignDefaultShop = async data => {
  const { getDefaultShop } = getService('shops');

  if (isNil(data.shop)) {
    data.shop = await getDefaultShop();
  }
};

/**
 * Syncronize related stores from a root one
 * @param {Object} entry entry to update
 * @param {Object} options
 * @param {Object} options.model corresponding model
 */
const syncStores = async (entry, { model }) => {
  if (Array.isArray(entry.stores)) {
    const newStores = [entry.id, ...entry.stores.map(prop('id'))];

    const updateStore = id => {
      const stores = newStores.filter(storeId => storeId !== id);

      return strapi.query(model.uid).update({ id }, { stores });
    };

    await Promise.all(entry.stores.map(({ id }) => updateStore(id)));
  }
};

/**
 * Update non shopEnabled fields of all the related stores of an entry with the entry values
 * @param {Object} entry entry to update
 * @param {Object} options
 * @param {Object} options.model corresponding model
 */
const syncNonShopEnabledAttributes = async (entry, { model }) => {
  const { copyNonShopEnabledAttributes } = getService('content-types');

  if (Array.isArray(entry.stores)) {
    const nonShopEnabledAttributes = copyNonShopEnabledAttributes(model, entry);

    if (isEmpty(nonShopEnabledAttributes)) {
      return;
    }

    const updateStore = id => strapi.query(model.uid).update({ id }, nonShopEnabledAttributes);

    await Promise.all(entry.stores.map(({ id }) => updateStore(id)));
  }
};

module.exports = {
  assignDefaultShop
  syncStores,
  syncNonShopEnabledAttributes,
};
