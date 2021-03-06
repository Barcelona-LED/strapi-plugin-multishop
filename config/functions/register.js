'use strict';

const _ = require('lodash');
const { PUBLISHED_AT_ATTRIBUTE } = require('strapi-utils').contentTypes.constants;

const { getService } = require('../../utils');
const fieldMigration = require('./migrations/field');
const enableContentTypeMigration = require('./migrations/content-type/enable');
const disableContentTypeMigration = require('./migrations/content-type/disable');

module.exports = () => {
  const contentTypeService = getService('content-types');
  const coreApiService = getService('core-api');

  _.set(strapi.plugins.multishop.config, 'schema.graphql', {});

  Object.values(strapi.contentTypes).forEach(contentType => {
    if (contentTypeService.isShopEnabledContentType(contentType)) {
      const { attributes, modelName } = contentType;

      _.set(attributes, 'stores', {
        writable: true,
        private: false,
        configurable: false,
        visible: false,
        collection: modelName,
        populate: ['_id', 'id', 'shop', PUBLISHED_AT_ATTRIBUTE],
      });

      _.set(attributes, 'shop', {
        writable: true,
        private: false,
        configurable: false,
        visible: false,
        type: 'string',
      });

      coreApiService.addCreateStoreAction(contentType);
      coreApiService.addGraphqlStoreAction(contentType);
    }
  });

  strapi.db.migrations.register(fieldMigration);
  strapi.db.migrations.register(enableContentTypeMigration);
  strapi.db.migrations.register(disableContentTypeMigration);
};
