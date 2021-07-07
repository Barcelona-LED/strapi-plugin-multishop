'use strict';

const { getNonShopEnabledAttributes } = require('../content-types');
const ctService = require('../../services/content-types');

describe('multishop - Controller - content-types', () => {
  describe('getNonShopEnabledAttributes', () => {
    beforeEach(() => {
      const getModel = () => {};
      global.strapi = {
        getModel,
        plugins: { multishop: { services: { 'content-types': ctService } } },
        admin: { services: { constants: { READ_ACTION: 'read', CREATE_ACTION: 'create' } } },
      };
    });

    test('model not shopEnabled', async () => {
      const badRequest = jest.fn();
      const ctx = {
        state: { user: {} },
        request: {
          body: {
            model: 'application::country.country',
            id: 1,
            shop: 'fr',
          },
        },
        badRequest,
      };
      await getNonShopEnabledAttributes(ctx);

      expect(badRequest).toHaveBeenCalledWith('model.not.shopEnabled');
    });

    test('entity not found', async () => {
      const notFound = jest.fn();
      const findOne = jest.fn(() => Promise.resolve(undefined));
      const getModel = jest.fn(() => ({ pluginOptions: { multishop: { shopEnabled: true } } }));

      global.strapi.query = () => ({ findOne });
      global.strapi.getModel = getModel;
      const ctx = {
        state: { user: {} },
        request: {
          body: {
            model: 'application::country.country',
            id: 1,
            shop: 'fr',
          },
        },
        notFound,
      };
      await getNonShopEnabledAttributes(ctx);

      expect(notFound).toHaveBeenCalledWith();
    });

    test('returns nonShopEnabledFields', async () => {
      const model = {
        pluginOptions: { multishop: { shopEnabled: true } },
        attributes: {
          name: { type: 'string' },
          averagePrice: { type: 'integer' },
          description: { type: 'string', pluginOptions: { multishop: { shopEnabled: true } } },
        },
      };
      const entity = {
        id: 1,
        name: "Papailhau's Pizza",
        description: 'Best pizza restaurant of the town',
        shop: 'en',
        published_at: '2021-03-30T09:34:54.042Z',
        stores: [{ id: 2, shop: 'it', published_at: null }],
      };
      const permissions = [
        { properties: { fields: ['name', 'averagePrice'], shops: ['it'] } },
        { properties: { fields: ['name', 'description'], shops: ['fr'] } },
        { properties: { fields: ['name'], shops: ['fr'] } },
      ];

      const findOne = jest.fn(() => Promise.resolve(entity));
      const find = jest.fn(() => Promise.resolve(permissions));
      const getModel = jest.fn(() => model);

      global.strapi.query = () => ({ findOne });
      global.strapi.getModel = getModel;
      global.strapi.admin.services.permission = { find };
      const ctx = {
        state: { user: { roles: [{ id: 1 }, { id: 2 }] } },
        request: {
          body: {
            model: 'application::country.country',
            id: 1,
            shop: 'fr',
          },
        },
      };
      await getNonShopEnabledAttributes(ctx);
      expect(find).toHaveBeenCalledWith({
        action_in: ['read', 'create'],
        subject: 'application::country.country',
        role_in: [1, 2],
      });
      expect(ctx.body).toEqual({
        nonShopEnabledFields: { name: "Papailhau's Pizza" },
        stores: [
          { id: 2, shop: 'it', published_at: null },
          { id: 1, shop: 'en', published_at: '2021-03-30T09:34:54.042Z' },
        ],
      });
    });
  });
});
