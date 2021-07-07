'use strict';

const { getService } = require('../../utils');

module.exports = async () => {
  const { sendDidInitializeEvent } = getService('metrics');
  const { decorator } = getService('entity-service-decorator');
  const { initDefaultShop } = getService('shops');
  const { sectionsBuilder, actions, engine } = getService('permissions');

  // Entity Service
  strapi.entityService.decorate(decorator);

  // Data
  await initDefaultShop();

  // Sections Builder
  sectionsBuilder.registerShopsPropertyHandler();

  // Actions
  await actions.registerMultishopActions();
  actions.registerMultishopActionsHooks();
  actions.updateActionsProperties();

  // Engine/Permissions
  engine.registerMultishopPermissionsHandlers();

  // Hooks & Models
  registerModelsHooks();

  sendDidInitializeEvent();
};

const registerModelsHooks = () => {
  Object.values(strapi.models)
    .filter(model => getService('content-types').isShopEnabledContentType(model))
    .forEach(model => {
      strapi.db.lifecycles.register({
        model: model.uid,
        async beforeCreate(data) {
          await getService('stores').assignDefaultShop(data);
        },
      });
    });

  strapi.db.lifecycles.register({
    model: 'plugins::multishop.shop',

    async afterCreate() {
      await getService('permissions').actions.syncSuperAdminPermissionsWithShops();
    },

    async afterDelete() {
      await getService('permissions').actions.syncSuperAdminPermissionsWithShops();
    },
  });
};
