import getShopFromQuery from './getShopFromQuery';

const getInitialShop = (query, shops = []) => {
  const shopFromQuery = getShopFromQuery(query);

  if (shopFromQuery) {
    return shops.find(shop => shop.code === shopFromQuery);
  }

  // Returns the default shop when nothing is in the query
  return shops.find(shop => shop.isDefault);
};

export default getInitialShop;
