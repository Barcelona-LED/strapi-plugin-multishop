'use strict';

const _ = require('lodash');
const { has, prop, pick, reduce, map, keys, toPath } = require('lodash/fp');
const { contentTypes, parseMultipartData, sanitizeEntity } = require('strapi-utils');

const { getService } = require('../utils');

const { getContentTypeRoutePrefix, isSingleType, getWritableAttributes } = contentTypes;

/**
 * Returns a parsed request body. It handles whether the body is multipart or not
 * @param {object} ctx - Koa request context
 * @returns {{ data: { [key: string]: any }, files: { [key: string]: any } }}
 */
const parseRequest = ctx => {
  if (ctx.is('multipart')) {
    return parseMultipartData(ctx);
  } else {
    return { data: ctx.request.body, files: {} };
  }
};

/**
 * Returns all shops for an entry
 * @param {object} entry
 * @returns {string[]}
 */
const getAllShops = entry => {
  return [entry.shop, ...map(prop('shop'), entry.stores)];
};

/**
 * Returns all stores ids for an entry
 * @param {object} entry
 * @returns {any[]}
 */
const getAllStoresIds = entry => {
  return [entry.id, ...map(prop('id'), entry.stores)];
};

/**
 * Returns a sanitizer object with a data & a file sanitizer for a content type
 * @param {object} contentType
 * @returns {{
 *    sanitizeInput(data: object): object,
 *    sanitizeInputFiles(files: object): object
 * }}
 */
const createSanitizer = contentType => {
  /**
   * Returns the writable attributes of a content type in the store routes
   * @returns {string[]}
   */
  const getAllowedAttributes = () => {
    return getWritableAttributes(contentType).filter(
      attributeName => !['shop', 'stores'].includes(attributeName)
    );
  };

  /**
   * Sanitizes uploaded files to keep only writable ones
   * @param {object} files - input files to sanitize
   * @returns {object}
   */
  const sanitizeInputFiles = files => {
    const allowedFields = getAllowedAttributes();
    return reduce(
      (acc, keyPath) => {
        const [rootKey] = toPath(keyPath);
        if (allowedFields.includes(rootKey)) {
          acc[keyPath] = files[keyPath];
        }

        return acc;
      },
      {},
      keys(files)
    );
  };

  /**
   * Sanitizes input data to keep only writable attributes
   * @param {object} data - input data to sanitize
   * @returns {object}
   */
  const sanitizeInput = data => {
    return pick(getAllowedAttributes(), data);
  };

  return { sanitizeInput, sanitizeInputFiles };
};

/**
 * Returns a handler to handle stores creation in the core api
 * @param {object} contentType
 * @returns {(object) => void}
 */
const createStoreHandler = contentType => {
  const { copyNonShopEnabledAttributes } = getService('content-types');

  const { sanitizeInput, sanitizeInputFiles } = createSanitizer(contentType);

  /**
   * Create shopEnabled entry from another one
   */
  const createFromBaseEntry = async (ctx, entry) => {
    const { data, files } = parseRequest(ctx);

    const { findByCode } = getService('shops');

    if (!has('shop', data)) {
      throw strapi.errors.badRequest('shop.missing');
    }

    const matchingShop = await findByCode(data.shop);
    if (!matchingShop) {
      throw strapi.errors.badRequest('shop.invalid');
    }

    const usedShops = getAllShops(entry);
    if (usedShops.includes(data.shop)) {
      throw strapi.errors.badRequest('shop.already.used');
    }

    const sanitizedData = {
      ...copyNonShopEnabledAttributes(contentType, entry),
      ...sanitizeInput(data),
      shop: data.shop,
      stores: getAllStoresIds(entry),
    };

    const sanitizedFiles = sanitizeInputFiles(files);

    const newEntry = await strapi.entityService.create(
      { data: sanitizedData, files: sanitizedFiles },
      { model: contentType.uid }
    );

    ctx.body = sanitizeEntity(newEntry, { model: strapi.getModel(contentType.uid) });
  };

  if (isSingleType(contentType)) {
    return async function(ctx) {
      const entry = await strapi.query(contentType.uid).findOne();

      if (!entry) {
        throw strapi.errors.notFound('baseEntryId.invalid');
      }

      await createFromBaseEntry(ctx, entry);
    };
  }

  return async function(ctx) {
    const { id: baseEntryId } = ctx.params;

    const entry = await strapi.query(contentType.uid).findOne({ id: baseEntryId });

    if (!entry) {
      throw strapi.errors.notFound('baseEntryId.invalid');
    }

    await createFromBaseEntry(ctx, entry);
  };
};

/**
 * Returns a route config to handle stores creation in the core api
 * @param {object} contentType
 * @returns {{ method: string, path: string, handler: string, config: { policies: string[] }}}
 */
const createStoreRoute = contentType => {
  const { modelName } = contentType;

  const routePrefix = getContentTypeRoutePrefix(contentType);
  const routePath = isSingleType(contentType)
    ? `/${routePrefix}/stores`
    : `/${routePrefix}/:id/stores`;

  return {
    method: 'POST',
    path: routePath,
    handler: `${modelName}.createStore`,
    config: {
      policies: [],
    },
  };
};

/**
 * Adds a route & an action to the core api controller of a content type to allow creating new stores
 * @param {object} contentType
 */
const addCreateStoreAction = contentType => {
  const { modelName, apiName } = contentType;

  const storeRoute = createStoreRoute(contentType);

  const coreApiControllerPath = `api.${apiName}.controllers.${modelName}.createStore`;
  const handler = createStoreHandler(contentType);

  strapi.config.routes.push(storeRoute);

  _.set(strapi, coreApiControllerPath, handler);
};

const mergeCustomizer = (dest, src) => {
  if (typeof dest === 'string') {
    return `${dest}\n${src}`;
  }
};

/**
 * Add a graphql schema to the plugin's global graphl schema to be processed
 * @param {object} schema
 */
const addGraphqlSchema = schema => {
  _.mergeWith(strapi.plugins.multishop.config.schema.graphql, schema, mergeCustomizer);
};

/**
 * Add store mutation & filters to use with the graphql plugin
 * @param {object} contentType
 */
const addGraphqlStoreAction = contentType => {
  const { globalId, modelName } = contentType;

  if (!strapi.plugins.graphql) {
    return;
  }

  const { toSingular, toPlural } = strapi.plugins.graphql.services.naming;

  // We use a string instead of an enum as the shops can be changed in the admin
  // NOTE: We could use a custom scalar so the validation becomes dynamic
  const shopArgs = {
    args: {
      shop: 'String',
    },
  };

  // add shop arguments in the existing queries
  if (isSingleType(contentType)) {
    const queryName = toSingular(modelName);
    const mutationSuffix = _.upperFirst(queryName);

    addGraphqlSchema({
      resolver: {
        Query: {
          [queryName]: shopArgs,
        },
        Mutation: {
          [`update${mutationSuffix}`]: shopArgs,
          [`delete${mutationSuffix}`]: shopArgs,
        },
      },
    });
  } else {
    const queryName = toPlural(modelName);

    addGraphqlSchema({
      resolver: {
        Query: {
          [queryName]: shopArgs,
          [`${queryName}Connection`]: shopArgs,
        },
      },
    });
  }

  // add new mutation to create a store
  const typeName = globalId;

  const capitalizedName = _.upperFirst(toSingular(modelName));
  const mutationName = `create${capitalizedName}Store`;
  const mutationDef = `${mutationName}(input: update${capitalizedName}Input!): ${typeName}!`;
  const actionName = `${contentType.uid}.createStore`;

  addGraphqlSchema({
    mutation: mutationDef,
    resolver: {
      Mutation: {
        [mutationName]: {
          resolver: actionName,
        },
      },
    },
  });
};

module.exports = {
  addCreateStoreAction,
  addGraphqlStoreAction,
  createSanitizer,
};
