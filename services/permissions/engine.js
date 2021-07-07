'use strict';

const { getService } = require('../../utils');

/**
 * @typedef {object} WillRegisterPermissionContext
 * @property {Permission} permission
 * @property {object} user
 * @property {object} condition
 */

/**
 * Shops property handler for the permission engine
 * Add the has-shop-access condition if the shops property is defined
 * @param {WillRegisterPermissionContext} context
 */
const willRegisterPermission = context => {
  const { permission, condition, user } = context;
  const { subject, properties } = permission;

  const isSuperAdmin = strapi.admin.services.role.hasSuperAdminRole(user);

  if (isSuperAdmin) {
    return;
  }

  const { shops } = properties || {};
  const { isShopEnabledContentType } = getService('content-types');

  // If there is no subject defined, ignore the permission
  if (!subject) {
    return;
  }

  const ct = strapi.contentTypes[subject];

  // If the subject exists but isn't shopEnabled, ignore the permission
  if (!isShopEnabledContentType(ct)) {
    return;
  }

  // If the subject is shopEnabled but the shops property is null (access to all shops), ignore the permission
  if (shops === null) {
    return;
  }

  condition.and({
    shop: {
      $in: shops || [],
    },
  });
};

const registerMultishopPermissionsHandlers = () => {
  const { engine } = strapi.admin.services.permission;

  engine.hooks.willRegisterPermission.register(willRegisterPermission);
};

module.exports = {
  willRegisterPermission,
  registerMultishopPermissionsHandlers,
};
