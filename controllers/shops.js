'use strict';

const { setCreatorFields, sanitizeEntity } = require('strapi-utils');
const { pick } = require('lodash/fp');
const { getService } = require('../utils');
const { validateCreateShopInput, validateUpdateShopInput } = require('../validation/shops');
const { formatShop } = require('../domain/shop');

const sanitizeShop = shop => {
  const model = strapi.getModel('shop', 'multishop');

  return sanitizeEntity(shop, { model });
};

module.exports = {
  async listShops(ctx) {
    const shopsService = getService('shops');

    const shops = await shopsService.find();

    ctx.body = await shopsService.setIsDefault(sanitizeShop(shops));
  },

  async createShop(ctx) {
    const { user } = ctx.state;
    const { body } = ctx.request;
    let { isDefault, ...shopToCreate } = body;

    try {
      await validateCreateShopInput(body);
    } catch (err) {
      return ctx.badRequest('ValidationError', err);
    }

    const shopsService = getService('shops');

    const existingShop = await shopsService.findByUrl(body.url);
    if (existingShop) {
      return ctx.badRequest('A shop in this path already exists');
    }

    shopToCreate = formatShop(shopToCreate);
    shopToCreate = setCreatorFields({ user })(shopToCreate);

    const shop = await shopsService.create(shopToCreate);

    if (isDefault) {
      await shopsService.setDefaultShop(shop);
    }

    ctx.body = await shopsService.setIsDefault(sanitizeShop(shop));
  },

  async updateShop(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;
    const { body } = ctx.request;
    let { isDefault, ...updates } = body;

    try {
      await validateUpdateShopInput(body);
    } catch (err) {
      return ctx.badRequest('ValidationError', err);
    }

    const shopsService = getService('shops');

    const existingShop = await shopsService.findById(id);
    if (!existingShop) {
      return ctx.notFound('shop.notFound');
    }

    const allowedParams = ['name', 'default_locale', 'url'];
    const cleanUpdates = setCreatorFields({ user, isEdition: true })(pick(allowedParams, updates));

    const updatedShop = await shopsService.update({ id }, cleanUpdates);

    if (isDefault) {
      await shopsService.setDefaultShop(updatedShop);
    }

    ctx.body = await shopsService.setIsDefault(sanitizeShop(updatedShop));
  },

  async deleteShop(ctx) {
    const { id } = ctx.params;

    const shopsService = getService('shops');

    const existingShop = await shopsService.findById(id);
    if (!existingShop) {
      return ctx.notFound('shop.notFound');
    }

    const defaultShopId = await shopsService.getDefaultShop();
    if (existingShop._id === defaultShopId) {
      return ctx.badRequest('Cannot delete the default shop');
    }

    await shopsService.delete({ id });

    ctx.body = await shopsService.setIsDefault(sanitizeShop(existingShop));
  },
};
