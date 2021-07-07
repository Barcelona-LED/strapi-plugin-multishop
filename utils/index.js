'use strict';

const { prop } = require('lodash/fp');

const getCoreStore = () =>
  strapi.store({
    environment: '',
    type: 'plugin',
    name: 'multishop',
  });

// retrieve a local service
const getService = name => {
  return prop(`multishop.services.${name}`, strapi.plugins);
};

module.exports = {
  getService,
  getCoreStore,
};
