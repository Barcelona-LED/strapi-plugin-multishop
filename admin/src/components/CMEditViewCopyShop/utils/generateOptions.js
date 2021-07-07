import get from 'lodash/get';

const generateOptions = (appShops, currentShop, stores, permissions) => {
  return appShops
    .filter(({ code }) => {
      return (
        code !== currentShop &&
        (stores || []).findIndex(({ shop }) => shop === code) !== -1
      );
    })
    .filter(({ code }) => {
      return permissions.some(({ properties }) => get(properties, 'shops', []).includes(code));
    })
    .map(shop => {
      return {
        label: shop.name,
        value: stores.find(loc => shop.code === loc.shop).id,
      };
    });
};

export default generateOptions;
