'use strict';

const { get } = require('lodash/fp');
const { getService } = require('../../utils');

const validateShopCreation = async (ctx, next) => {
  const { model } = ctx.params;
  const { query, body } = ctx.request;

  const {
    getValidShop,
    getNewStoresFrom,
    isShopEnabledContentType,
    getAndValidateRelatedEntity,
    fillNonShopEnabledAttributes,
  } = getService('content-types');

  const modelDef = strapi.getModel(model);

  if (!isShopEnabledContentType(modelDef)) {
    return next();
  }

  const shop = get('plugins.multishop.shop', query);
  const relatedEntityId = get('plugins.multishop.relatedEntityId', query);
  // cleanup to avoid creating duplicates in singletypes
  ctx.request.query = {};

  let entityShop;
  try {
    entityShop = await getValidShop(shop);
  } catch (e) {
    return ctx.badRequest("This shop doesn't exist");
  }

  body.shop = entityShop;

  if (modelDef.kind === 'singleType') {
    const entity = await strapi.entityService.find(
      { params: { _shop: entityShop } },
      { model }
    );

    ctx.request.query._shop = body.shop;

    // updating
    if (entity) {
      return next();
    }
  }

  let relatedEntity;
  try {
    relatedEntity = await getAndValidateRelatedEntity(relatedEntityId, model, shop);
  } catch (e) {
    return ctx.badRequest(
      "The related entity doesn't exist or the entity already exists in this shop"
    );
  }

  fillNonShopEnabledAttributes(body, relatedEntity, { model });
  const stores = await getNewStoresFrom(relatedEntity);
  body.stores = stores;

  return next();
};

module.exports = validateShopCreation;
