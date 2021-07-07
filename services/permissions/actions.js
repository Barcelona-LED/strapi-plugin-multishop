'use strict';

const { capitalize, isArray, getOr, prop } = require('lodash/fp');
const { getService } = require('../../utils');

const actions = ['create', 'read', 'update', 'delete'].map(uid => ({
  section: 'settings',
  category: 'Multishop',
  subCategory: 'Shops',
  pluginName: 'multishop',
  displayName: capitalize(uid),
  uid: `shop.${uid}`,
}));

const addShopsPropertyIfNeeded = ({ value: action }) => {
  const {
    section,
    options: { applyToProperties },
  } = action;

  // Only add the shops property to contentTypes' actions
  if (section !== 'contentTypes') {
    return;
  }

  // If the 'shops' property is already declared within the applyToProperties array, then ignore the next steps
  if (isArray(applyToProperties) && applyToProperties.includes('shops')) {
    return;
  }

  // Add the 'shops' property to the applyToProperties array (create it if necessary)
  action.options.applyToProperties = isArray(applyToProperties)
    ? applyToProperties.concat('shops')
    : ['shops'];
};

const shouldApplyShopsPropertyToSubject = ({ property, subject }) => {
  if (property === 'shops') {
    const model = strapi.getModel(subject);

    return getService('content-types').isShopEnabledContentType(model);
  }

  return true;
};

const addAllShopsToPermissions = async permissions => {
  const { actionProvider } = strapi.admin.services.permission;
  const { find: findAllShops } = getService('shops');

  const allShops = await findAllShops();
  const allShopsCode = allShops.map(prop('code'));

  return Promise.all(
    permissions.map(async permission => {
      const { action, subject } = permission;

      const appliesToShopsProperty = await actionProvider.appliesToProperty(
        'shops',
        action,
        subject
      );

      if (!appliesToShopsProperty) {
        return permission;
      }

      const oldPermissionProperties = getOr({}, 'properties', permission);

      return { ...permission, properties: { ...oldPermissionProperties, shops: allShopsCode } };
    })
  );
};

const syncSuperAdminPermissionsWithShops = async () => {
  const roleService = strapi.admin.services.role;
  const permissionService = strapi.admin.services.permission;

  const superAdminRole = await roleService.getSuperAdmin();

  if (!superAdminRole) {
    return;
  }

  const superAdminPermissions = await permissionService.findUserPermissions({
    roles: [superAdminRole],
  });

  const newSuperAdminPermissions = await addAllShopsToPermissions(superAdminPermissions);

  await roleService.assignPermissions(superAdminRole.id, newSuperAdminPermissions);
};

const registerMultishopActions = async () => {
  const { actionProvider } = strapi.admin.services.permission;

  await actionProvider.registerMany(actions);
};

const registerMultishopActionsHooks = () => {
  const { actionProvider } = strapi.admin.services.permission;
  const { hooks } = strapi.admin.services.role;

  actionProvider.hooks.appliesPropertyToSubject.register(shouldApplyShopsPropertyToSubject);
  hooks.willResetSuperAdminPermissions.register(addAllShopsToPermissions);
};

const updateActionsProperties = () => {
  const { actionProvider } = strapi.admin.services.permission;

  // Register the transformation for every new action
  actionProvider.hooks.willRegister.register(addShopsPropertyIfNeeded);

  // Handle already registered actions
  actionProvider.values().forEach(action => addShopsPropertyIfNeeded({ value: action }));
};

module.exports = {
  actions,
  registerMultishopActions,
  registerMultishopActionsHooks,
  updateActionsProperties,
  syncSuperAdminPermissionsWithShops,
};
