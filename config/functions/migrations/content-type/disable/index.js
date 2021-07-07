'use strict';

const { getDefaultShop } = require('../utils');
const { getService } = require('../../../../../utils');

const migrateForBookshelf = require('./migrate-for-bookshelf');
const migrateForMongoose = require('./migrate-for-mongoose');

const after = () => {};

// Disable multishop on CT -> Delete all entities that are not in the default shop
const before = async ({ model, definition, previousDefinition, ORM }, context) => {
  const { isShopEnabledContentType } = getService('content-types');

  if (isShopEnabledContentType(definition) || !isShopEnabledContentType(previousDefinition)) {
    return;
  }

  const defaultShop = await getDefaultShop(model, ORM);

  if (model.orm === 'bookshelf') {
    await migrateForBookshelf(
      { ORM, defaultShop, definition, previousDefinition, model },
      context
    );
  } else if (model.orm === 'mongoose') {
    await migrateForMongoose({ ORM, defaultShop, model });
  }
};

module.exports = {
  before,
  after,
};
