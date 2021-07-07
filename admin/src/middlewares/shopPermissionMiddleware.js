import get from 'lodash/get';

const filterPermissionWithShop = shop => permission =>
  get(permission, 'properties.shops', []).indexOf(shop) !== -1;

const shopPermissionMiddleware = () => () => next => action => {
  if (action.type !== 'ContentManager/RBACManager/SET_PERMISSIONS') {
    return next(action);
  }

  const containerName = get(action, '__meta__.containerName', null);

  if (!['editView', 'listView'].includes(containerName)) {
    return next(action);
  }

  const shop = get(action, '__meta__.plugins.multishop.shop', null);

  if (!shop) {
    return next(action);
  }

  const permissions = action.permissions;

  const nextPermissions = Object.keys(permissions).reduce((acc, key) => {
    const currentPermission = permissions[key];
    const filteredPermissions = currentPermission.filter(filterPermissionWithShop(shop));

    if (filteredPermissions.length) {
      acc[key] = filteredPermissions;
    }

    return acc;
  }, {});

  return next({ ...action, permissions: nextPermissions });
};

export default shopPermissionMiddleware;
