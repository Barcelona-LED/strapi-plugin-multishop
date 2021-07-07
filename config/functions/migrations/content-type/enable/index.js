'use strict';

const { getService } = require('../../../../../utils');
const { getDefaultShop } = require('../utils');

const updateShop = (model, ORM, shop) => {
  if (model.orm === 'bookshelf') {
    return ORM.knex
      .update({ shop })
      .from(model.collectionName)
      .where({ shop: null });
  }

  if (model.orm === 'mongoose') {
    return model.updateMany(
      { $or: [{ shop: { $exists: false } }, { shop: null }] },
      { shop }
    );
  }
};

// Enable multishop on CT -> Add default shop to all existing entities
const after = async ({ model, definition, previousDefinition, ORM }) => {
  const { isShopEnabledContentType } = getService('content-types');

  if (!isShopEnabledContentType(definition) || isShopEnabledContentType(previousDefinition)) {
    return;
  }

  const defaultShop = await getDefaultShop(model, ORM);

  await updateShop(model, ORM, defaultShop);
};

const before = () => {};

module.exports = {
  before,
  after,
};
