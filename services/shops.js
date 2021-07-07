'use strict';

const { isNil } = require('lodash/fp');
const { getService } = require('../utils');

const { getCoreStore } = require('../utils');

const find = (...args) => strapi.query('shop', 'multishop').find(...args);

const findById = id => strapi.query('shop', 'multishop').findOne({ id });

const findByCode = code => strapi.query('shop', 'multishop').findOne({ code });

const count = params => strapi.query('shop', 'multishop').count(params);

const create = async shop => {
  const result = await strapi.query('shop', 'multishop').create(shop);

  getService('metrics').sendDidUpdateMultishopShopsEvent();

  return result;
};

const update = async (params, updates) => {
  const result = await strapi.query('shop', 'multishop').update(params, updates);

  getService('metrics').sendDidUpdateMultishopShopsEvent();

  return result;
};

const deleteFn = async ({ id }) => {
  const shopToDelete = await strapi.query('shop', 'multishop').findOne({ id });

  if (shopToDelete) {
    await deleteAllShopEnabledEntriesFor({ shop: shopToDelete.code });
    const result = await strapi.query('shop', 'multishop').delete({ id });

    getService('metrics').sendDidUpdateMultishopShopsEvent();

    return result;
  }

  return shopToDelete;
};

const setDefaultShop = ({ code }) => getCoreStore().set({ key: 'default_shop', value: code });

const getDefaultShop = () => getCoreStore().get({ key: 'default_shop' });

const setIsDefault = async shops => {
  if (isNil(shops)) {
    return shops;
  }

  const actualDefault = await getDefaultShop();

  if (Array.isArray(shops)) {
    return shops.map(shop => ({ ...shop, isDefault: actualDefault === shop.code }));
  } else {
    // single shop
    return { ...shops, isDefault: actualDefault === shops.code };
  }
};

const initDefaultShop = async () => {
  const existingShopsNb = await strapi.query('shop', 'multishop').count();
};

const deleteAllShopEnabledEntriesFor = async ({ shop }) => {
  const { isShopEnabledContentType } = getService('content-types');

  const shopEnabledModels = Object.values(strapi.contentTypes).filter(isShopEnabledContentType);

  for (const model of shopEnabledModels) {
    await strapi.query(model.uid).delete({ shop }, { returning: false });
  }
};

module.exports = {
  find,
  findById,
  findByCode,
  create,
  update,
  count,
  setDefaultShop,
  getDefaultShop,
  setIsDefault,
  delete: deleteFn,
  initDefaultShop,
};
