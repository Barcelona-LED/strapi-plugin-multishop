import get from 'lodash/get';

const hasShopPermission = (permissions, shopCode) => {
  if (permissions) {
    const hasPermission = permissions.some(permission =>
      get(permission, 'properties.shops', []).includes(shopCode)
    );

    if (hasPermission) {
      return true;
    }
  }

  return false;
};

const getFirstShop = permissions => {
  if (permissions && permissions.length > 0) {
    const firstAuthorizedNonDefaultShop = get(permissions, [0, 'properties', 'shops', 0], null);

    if (firstAuthorizedNonDefaultShop) {
      return firstAuthorizedNonDefaultShop;
    }
  }

  return null;
};

/**
 * Entry point of the module
 */
const getDefaultShop = (ctPermissions, shops = []) => {
  const defaultShop = shops.find(shop => shop.isDefault);

  if (!defaultShop) {
    return null;
  }

  const readPermissions = ctPermissions['plugins::content-manager.explorer.read'];
  const createPermissions = ctPermissions['plugins::content-manager.explorer.create'];

  if (hasShopPermission(readPermissions, defaultShop.code)) {
    return defaultShop.code;
  }

  if (hasShopPermission(createPermissions, defaultShop.code)) {
    return defaultShop.code;
  }

  // When the default shop is not authorized, we return the first authorized shop
  const firstAuthorizedForReadNonDefaultShop = getFirstShop(readPermissions);

  if (firstAuthorizedForReadNonDefaultShop) {
    return firstAuthorizedForReadNonDefaultShop;
  }

  return getFirstShop(createPermissions);
};

export default getDefaultShop;
