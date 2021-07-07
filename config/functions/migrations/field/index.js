'use strict';

const { difference, keys, intersection, isEmpty } = require('lodash/fp');
const { getService } = require('../../../../utils');
const migrateForMongoose = require('./migrate-for-mongoose');
const migrateForBookshelf = require('./migrate-for-bookshelf');

// Migration when multishop is disabled on a field of a content-type that have multishop enabled
const after = async ({ model, definition, previousDefinition, ORM }) => {
  const { isShopEnabledContentType, getShopEnabledAttributes } = getService('content-types');

  if (!isShopEnabledContentType(model) || !isShopEnabledContentType(previousDefinition)) {
    return;
  }

  const shopEnabledAttributes = getShopEnabledAttributes(definition);
  const prevShopEnabledAttributes = getShopEnabledAttributes(previousDefinition);
  const attributesDisabled = difference(prevShopEnabledAttributes, shopEnabledAttributes);
  const attributesToMigrate = intersection(keys(definition.attributes), attributesDisabled);

  if (isEmpty(attributesToMigrate)) {
    return;
  }

  if (model.orm === 'bookshelf') {
    await migrateForBookshelf({ ORM, model, attributesToMigrate });
  } else if (model.orm === 'mongoose') {
    await migrateForMongoose({ model, attributesToMigrate });
  }
};

const before = () => {};

module.exports = {
  before,
  after,
};
