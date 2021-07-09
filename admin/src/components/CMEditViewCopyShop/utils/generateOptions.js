import get from 'lodash/get';

const generateOptions = (appShops, currentShop, stores, permissions) => {
  return appShops
    .filter(({ id }) => {
      return (
        id !== currentShop &&
        (stores || []).findIndex(({ shop }) => shop === id) !== -1
      );
    })
    .filter(({ id }) => {
      return permissions.some(({ properties }) => get(properties, 'shops', []).includes(id));
    })
    .map(shop => {
      return {
        label: shop.name,
        value: shop.id,
      };
    });
};

export default generateOptions;
