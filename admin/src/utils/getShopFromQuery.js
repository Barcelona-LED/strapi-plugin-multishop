import get from 'lodash/get';

const getShopFromQuery = query => {
  return get(query, 'plugins.multishop.shop', undefined);
};

export default getShopFromQuery;
