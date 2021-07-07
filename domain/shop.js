'use strict';

const formatShop = shop => {
  return {
    ...shop,
    name: shop.name || null,
  };
};

module.exports = { formatShop };
