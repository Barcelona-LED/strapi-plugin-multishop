'use strict';

const _ = require('lodash');

module.exports = {
    resolver: {
      Query: {
          shop: {
            resolverOf: 'plugins::multishop.shops.getShop',
            resolver: async (obj, options, { context }) => {
              context.params = { ...context.params, ...options.input };
    
              await strapi.plugins['multishop'].controllers.shops.getShop(context);
    
              return context.body.shop;
            },
          },
          shops: {
            resolverOf: 'plugins::multishop.shops.getShops', 
            resolver: async (obj, options, { context }) => {
              context.params = { ...context.params, ...options.input };
    
              await strapi.plugins['multishop'].controllers.shops.getShops(context);
    
              return context.body.shops;
            },
          }
      }
    }
}