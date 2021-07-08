'use strict';

const _ = require('lodash');
const { pick, pipe, has, prop, isNil, cloneDeep, isArray } = require('lodash/fp');
const {
  isRelationalAttribute,
  getVisibleAttributes,
  isMediaAttribute,
  isTypedAttribute,
} = require('strapi-utils').contentTypes;
const { getService } = require('../utils');

const hasShopEnabledOption = modelOrAttribute => {
  return prop('pluginOptions.multishop.shopEnabled', modelOrAttribute) === true;
};

const getValidShop = async shop => {
  const shopsService = getService('shops');

  if (isNil(shop)) {
    return shopsService.getDefaultShop();
  }

  const foundShop = await shopsService.findById(shop);
  if (!foundShop) {
    throw new Error('Shop not found');
  }

  return shop;
};

/**
 * Get the related entity used for entity creation
 * @param {Object} relatedEntity related entity
 * @returns {id[]} related entity
 */
const getNewStoresFrom = async relatedEntity => {
  if (relatedEntity) {
    return [relatedEntity.id, ...relatedEntity.stores.map(prop('id'))];
  }

  return [];
};

/**
 * Get the related entity used for entity creation
 * @param {id} relatedEntityId related entity id
 * @param {string} model corresponding model
 * @param {string} shop shop of the entity to create
 * @returns {Object} related entity
 */
const getAndValidateRelatedEntity = async (relatedEntityId, model, shop) => {
  const { kind } = strapi.getModel(model);
  let relatedEntity;

  if (kind === 'singleType') {
    relatedEntity = await strapi.query(model).findOne({});
  } else if (relatedEntityId) {
    relatedEntity = await strapi.query(model).findOne({ id: relatedEntityId });
  }

  if (relatedEntityId && !relatedEntity) {
    throw new Error("The related entity doesn't exist");
  }

  if (
    relatedEntity &&
    (relatedEntity.shop === shop ||
      relatedEntity.stores.map(prop('shop')).includes(shop))
  ) {
    throw new Error('The entity already exists in this shop');
  }

  return relatedEntity;
};

/**
 * Returns whether an attribute is shopEnabled or not
 * @param {*} attribute
 * @returns
 */
const isShopEnabledAttribute = (model, attributeName) => {
  const attribute = model.attributes[attributeName];

  return (
    hasShopEnabledOption(attribute) ||
    (isRelationalAttribute(attribute) && !isMediaAttribute(attribute)) ||
    isTypedAttribute(attribute, 'uid')
  );
};

/**
 * Returns whether a model is shopEnabled or not
 * @param {*} model
 * @returns
 */
const isShopEnabledContentType = model => {
  return hasShopEnabledOption(model);
};

/**
 * Returns the list of attribute names that are not shopEnabled
 * @param {object} model
 * @returns {string[]}
 */
const getNonShopEnabledAttributes = model => {
  return getVisibleAttributes(model).filter(
    attributeName => !isShopEnabledAttribute(model, attributeName)
  );
};

const removeId = value => {
  if (typeof value === 'object' && (has('id', value) || has('_id', value))) {
    delete value.id;
    delete value._id;
  }
};

const removeIds = model => entry => removeIdsMut(model, cloneDeep(entry));

const removeIdsMut = (model, entry) => {
  if (isNil(entry)) {
    return entry;
  }

  removeId(entry);

  _.forEach(model.attributes, (attr, attrName) => {
    const value = entry[attrName];
    if (attr.type === 'dynamiczone' && isArray(value)) {
      value.forEach(compo => {
        if (has('__component', compo)) {
          const model = strapi.components[compo.__component];
          removeIdsMut(model, compo);
        }
      });
    } else if (attr.type === 'component') {
      const [model] = strapi.db.getModelsByAttribute(attr);
      if (isArray(value)) {
        value.forEach(compo => removeIdsMut(model, compo));
      } else {
        removeIdsMut(model, value);
      }
    }
  });

  return entry;
};

/**
 * Returns a copy of an entry picking only its non shopEnabled attributes
 * @param {object} model
 * @param {object} entry
 * @returns {object}
 */
const copyNonShopEnabledAttributes = (model, entry) => {
  const nonShopEnabledAttributes = getNonShopEnabledAttributes(model);

  return pipe(pick(nonShopEnabledAttributes), removeIds(model))(entry);
};

/**
 * Returns the list of attribute names that are shopEnabled
 * @param {object} model
 * @returns {string[]}
 */
const getShopEnabledAttributes = model => {
  return getVisibleAttributes(model).filter(attributeName =>
    isShopEnabledAttribute(model, attributeName)
  );
};

/**
 * Fill non shopEnabled fields of an entry if there are nil
 * @param {Object} entry entry to fill
 * @param {Object} relatedEntry values used to fill
 * @param {Object} options
 * @param {Object} options.model corresponding model
 */
const fillNonShopEnabledAttributes = (entry, relatedEntry, { model }) => {
  if (isNil(relatedEntry)) {
    return;
  }

  const modelDef = strapi.getModel(model);
  const relatedEntryCopy = copyNonShopEnabledAttributes(modelDef, relatedEntry);

  _.forEach(relatedEntryCopy, (value, field) => {
    if (isNil(entry[field])) {
      entry[field] = value;
    }
  });
};

module.exports = {
  isShopEnabledContentType,
  getValidShop,
  getNewStoresFrom,
  getShopEnabledAttributes,
  getNonShopEnabledAttributes,
  copyNonShopEnabledAttributes,
  getAndValidateRelatedEntity,
  fillNonShopEnabledAttributes,
};
