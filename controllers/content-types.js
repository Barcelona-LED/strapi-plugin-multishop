'use strict';

const { pick, uniq, prop, getOr, flatten, pipe, map } = require('lodash/fp');
const { contentTypes: contentTypesUtils } = require('strapi-utils');
const { getService } = require('../utils');
const { validateGetNonShopEnabledAttributesInput } = require('../validation/content-types');

const { PUBLISHED_AT_ATTRIBUTE } = contentTypesUtils.constants;

const getShopsProperty = getOr([], 'properties.shops');
const getFieldsProperty = prop('properties.fields');

const getFirstLevelPath = map(path => path.split('.')[0]);

module.exports = {
  async getNonShopEnabledAttributes(ctx) {
    const { user } = ctx.state;
    const { model, id, shop } = ctx.request.body;

    try {
      await validateGetNonShopEnabledAttributesInput({ model, id, shop });
    } catch (err) {
      return ctx.badRequest('ValidationError', err);
    }

    const modelDef = strapi.getModel(model);
    const { copyNonShopEnabledAttributes, isShopEnabledContentType } = getService('content-types');
    const { READ_ACTION, CREATE_ACTION } = strapi.admin.services.constants;

    if (!isShopEnabledContentType(modelDef)) {
      return ctx.badRequest('model.not.shopEnabled');
    }

    let params = modelDef.kind === 'singleType' ? {} : { id };

    const entity = await strapi.query(model).findOne(params);

    if (!entity) {
      return ctx.notFound();
    }

    const permissions = await strapi.admin.services.permission.find({
      action_in: [READ_ACTION, CREATE_ACTION],
      subject: model,
      role_in: user.roles.map(prop('id')),
    });

    const shopPermissions = permissions
      .filter(perm => getShopsProperty(perm).includes(shop))
      .map(getFieldsProperty);

    const permittedFields = pipe(flatten, getFirstLevelPath, uniq)(shopPermissions);

    const nonShopEnabledFields = copyNonShopEnabledAttributes(modelDef, entity);
    const sanitizedNonShopEnabledFields = pick(permittedFields, nonShopEnabledFields);

    ctx.body = {
      nonShopEnabledFields: sanitizedNonShopEnabledFields,
      stores: entity.stores.concat(
        pick(['id', 'shop', PUBLISHED_AT_ATTRIBUTE], entity)
      ),
    };
  },
};
