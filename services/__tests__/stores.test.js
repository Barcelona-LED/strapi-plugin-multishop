'use strict';

const {
  assignDefaultShop
  syncStores,
  syncNonShopEnabledAttributes,
} = require('../stores');

const shops = require('../shops');
const contentTypes = require('../content-types');

const model = {
  uid: 'test-model',
  pluginOptions: {
    multishop: {
      shopEnabled: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
      pluginOptions: {
        multishop: {
          shopEnabled: true,
        },
      },
    },
    stars: {
      type: 'integer',
    },
  },
};

const allShopEnabledModel = {
  uid: 'test-model',
  pluginOptions: {
    multishop: {
      shopEnabled: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
      pluginOptions: {
        multishop: {
          shopEnabled: true,
        },
      },
    },
    stars: {
      type: 'integer',
      pluginOptions: {
        multishop: {
          shopEnabled: true,
        },
      },
    },
  },
};

const setGlobalStrapi = () => {
  global.strapi = {
    plugins: {
      multishop: {
        services: {
          shops,
          'content-types': contentTypes,
        },
      },
    },
  };
};

describe('stores service', () => {
  describe('assignDefaultShop', () => {
    test('Does not change the input if shop is already defined', async () => {
      setGlobalStrapi();
      const input = { shop: 'myShop' };
      await assignDefaultShop(input);

      expect(input).toStrictEqual({ shop: 'myShop' });
    });

    test('Use default shop to set the shop on the input data', async () => {
      setGlobalStrapi();

      const getDefaultShopMock = jest.fn(() => 'defaultShop');

      global.strapi.plugins.multishop.services.shops.getDefaultShop = getDefaultShopMock;

      const input = {};
      await assignDefaultShop(input);

      expect(input).toStrictEqual({ shop: 'defaultShop' });
      expect(getDefaultShopMock).toHaveBeenCalled();
    });
  });

  describe('syncStores', () => {
    test('Updates every other stores with correct ids', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const stores = [{ id: 2 }, { id: 3 }];
      const entry = { id: 1, shop: 'test', stores };

      await syncStores(entry, { model });

      expect(update).toHaveBeenCalledTimes(stores.length);
      expect(update).toHaveBeenNthCalledWith(1, { id: 2 }, { stores: [1, 3] });
      expect(update).toHaveBeenNthCalledWith(2, { id: 3 }, { stores: [1, 2] });
    });
  });

  describe('syncNonShopEnabledAttributes', () => {
    test('Does nothing if no stores set', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = { id: 1, shop: 'test' };

      await syncNonShopEnabledAttributes(entry, { model });

      expect(update).not.toHaveBeenCalled();
    });

    test('Does not update the current shop', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = { id: 1, shop: 'test', stores: [] };

      await syncNonShopEnabledAttributes(entry, { model });

      expect(update).not.toHaveBeenCalled();
    });

    test('Does not update if all the fields are shopEnabled', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = { id: 1, shop: 'test', stores: [] };

      await syncNonShopEnabledAttributes(entry, { model: allShopEnabledModel });

      expect(update).not.toHaveBeenCalled();
    });

    test('Updates shops with non shopEnabled fields only', async () => {
      setGlobalStrapi();

      const update = jest.fn();
      global.strapi.query = () => {
        return { update };
      };

      const entry = {
        id: 1,
        shop: 'test',
        title: 'ShopEnabled',
        stars: 1,
        stores: [{ id: 2, shop: 'fr' }],
      };

      await syncNonShopEnabledAttributes(entry, { model });

      expect(update).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith({ id: 2 }, { stars: 1 });
    });
  });
});
