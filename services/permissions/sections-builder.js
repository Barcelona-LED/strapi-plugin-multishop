'use strict';

const { isEmpty } = require('lodash/fp');

const { getService } = require('../../utils');

/**
 * Handler for the permissions layout (sections builder)
 * Adds the shops property to the subjects
 * @param {Action} action
 * @param {ContentTypesSection} section
 * @return {Promise<void>}
 */
const shopsPropertyHandler = async ({ action, section }) => {
  const { actionProvider } = strapi.admin.services.permission;

  const shops = await getService('shops').find();

  // Do not add the shops property if there is none registered
  if (isEmpty(shops)) {
    return;
  }

  for (const subject of section.subjects) {
    const applies = await actionProvider.appliesToProperty('shops', action.actionId, subject.uid);
    const hasShopsProperty = subject.properties.find(property => property.value === 'shops');

    if (applies && !hasShopsProperty) {
      subject.properties.push({
        label: 'Shops',
        value: 'shops',
        children: shops.map(({ name, code }) => ({ label: name || code, value: code })),
      });
    }
  }
};

const registerShopsPropertyHandler = () => {
  const { sectionsBuilder } = strapi.admin.services.permission;

  sectionsBuilder.addHandler('singleTypes', shopsPropertyHandler);
  sectionsBuilder.addHandler('collectionTypes', shopsPropertyHandler);
};

module.exports = {
  shopsPropertyHandler,
  registerShopsPropertyHandler,
};
