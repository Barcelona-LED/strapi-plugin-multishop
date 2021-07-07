'use strict';

const { has, omit, isArray } = require('lodash/fp');
const { getService } = require('../utils');

const { syncStores, syncNonShopEnabledAttributes } = require('./stores');

const SHOP_QUERY_FILTER = '_shop';
const SINGLE_ENTRY_ACTIONS = ['findOne', 'update', 'delete'];
const BULK_ACTIONS = ['delete'];

const paramsContain = (key, params) => {
  return (
    has(key, params) ||
    has(key, params._where) ||
    (isArray(params._where) && params._where.some(clause => has(key, clause)))
  );
};

/**
 * Adds default shop or replaces _shop by shop in query params
 * @param {object} params - query params
 */
const wrapParams = async (params = {}, ctx = {}) => {
  const { action } = ctx;

  if (has(SHOP_QUERY_FILTER, params)) {
    if (params[SHOP_QUERY_FILTER] === 'all') {
      return omit(SHOP_QUERY_FILTER, params);
    }

    return {
      ...omit(SHOP_QUERY_FILTER, params),
      shop: params[SHOP_QUERY_FILTER],
    };
  }

  const entityDefinedById = paramsContain('id', params) && SINGLE_ENTRY_ACTIONS.includes(action);
  const entitiesDefinedByIds = paramsContain('id_in', params) && BULK_ACTIONS.includes(action);

  if (entityDefinedById || entitiesDefinedByIds) {
    return params;
  }

  const { getDefaultShop } = getService('shops');

  return {
    ...params,
    shop: await getDefaultShop(),
  };
};

/**
 * Assigns a valid shop or the default one if not define
 * @param {object} data
 */
const assignValidShop = async data => {
  const { getValidShop } = getService('content-types');

  try {
    data.shop = await getValidShop(data.shop);
  } catch (e) {
    throw strapi.errors.badRequest("This shop doesn't exist");
  }
};

/**
 * Decorates the entity service with Multishop business logic
 * @param {object} service - entity service
 */
const decorator = service => ({
  /**
   * Wraps query options. In particular will add default shop to query params
   * @param {object} opts - Query options object (params, data, files, populate)
   * @param {object} ctx - Query context
   * @param {object} ctx.model - Model that is being used
   */

  async wrapOptions(opts = {}, ctx = {}) {
    const wrappedOptions = await service.wrapOptions.call(this, opts, ctx);

    const model = strapi.db.getModel(ctx.model);

    const { isShopEnabledContentType } = getService('content-types');

    if (!isShopEnabledContentType(model)) {
      return wrappedOptions;
    }

    return {
      ...wrappedOptions,
      params: await wrapParams(wrappedOptions.params, ctx),
    };
  },

  /**
   * Creates an entry & make links between it and its related localizaionts
   * @param {object} opts - Query options object (params, data, files, populate)
   * @param {object} ctx - Query context
   * @param {object} ctx.model - Model that is being used
   */
  async create(opts, ctx) {
    const model = strapi.db.getModel(ctx.model);

    const { isShopEnabledContentType } = getService('content-types');

    if (!isShopEnabledContentType(model)) {
      return service.create.call(this, opts, ctx);
    }

    const { data } = opts;
    await assignValidShop(data);

    const entry = await service.create.call(this, opts, ctx);

    await syncStores(entry, { model });
    await syncNonShopEnabledAttributes(entry, { model });
    return entry;
  },

  /**
   * Updates an entry & update related stores fields
   * @param {object} opts - Query options object (params, data, files, populate)
   * @param {object} ctx - Query context
   * @param {object} ctx.model - Model that is being used
   */
  async update(opts, ctx) {
    const model = strapi.db.getModel(ctx.model);

    const { isShopEnabledContentType } = getService('content-types');

    if (!isShopEnabledContentType(model)) {
      return service.update.call(this, opts, ctx);
    }

    const { data, ...restOptions } = opts;

    const entry = await service.update.call(
      this,
      {
        data: omit(['shop', 'stores'], data),
        ...restOptions,
      },
      ctx
    );

    await syncNonShopEnabledAttributes(entry, { model });
    return entry;
  },
});

module.exports = {
  decorator,
  wrapParams,
};
