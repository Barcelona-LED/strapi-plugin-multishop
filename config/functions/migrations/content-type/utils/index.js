'use strict';

const getDefaultShop = async (model, ORM) => {
  let defaultShopRows;
  if (model.orm === 'bookshelf') {
    defaultShopRows = await ORM.knex
      .select('value')
      .from('core_store')
      .where({ key: 'plugin_multishop_default_shop' });
  } else if (model.orm === 'mongoose') {
    defaultShopRows = await strapi.models['core_store'].find({
      key: 'plugin_multishop_default_shop',
    });
  }

  if (defaultShopRows.length > 0) {
    return JSON.parse(defaultShopRows[0].value);
  }

  return null;
};

module.exports = {
  getDefaultShop
};
