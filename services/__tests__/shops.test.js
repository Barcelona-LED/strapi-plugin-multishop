'use strict';

const shopsService = require('../shops');

const fakeMetricsService = {
  sendDidInitializeEvent() {},
  sendDidUpdateMultishopShopsEvent() {},
};

describe('Shops', () => {
  describe('setIsDefault', () => {
    test('Set isDefault to false', async () => {
      const get = jest.fn(() => Promise.resolve('en'));
      global.strapi = { store: () => ({ get }) };

      const shop = {
        code: 'fr',
        name: 'French',
      };

      const enrichedShop = await shopsService.setIsDefault(shop);
      expect(enrichedShop).toMatchObject({
        ...shop,
        isDefault: false,
      });
    });

    test('Set isDefault to true', async () => {
      const get = jest.fn(() => Promise.resolve('en'));
      global.strapi = { store: () => ({ get }) };

      const shop = {
        code: 'en',
        name: 'English',
      };

      const enrichedShop = await shopsService.setIsDefault(shop);
      expect(enrichedShop).toMatchObject({
        ...shop,
        isDefault: true,
      });
    });
  });

  describe('getDefaultShop', () => {
    test('get default shop', async () => {
      const get = jest.fn(() => Promise.resolve('en'));
      global.strapi = { store: () => ({ get }) };

      const defaultShopCode = await shopsService.getDefaultShop();
      expect(defaultShopCode).toBe('en');
    });
  });

  describe('setDefaultShop', () => {
    test('set default shop', async () => {
      const set = jest.fn(() => Promise.resolve());
      global.strapi = { store: () => ({ set }) };

      await shopsService.setDefaultShop({ code: 'fr-CA' });
      expect(set).toHaveBeenCalledWith({ key: 'default_shop', value: 'fr-CA' });
    });
  });

  describe('CRUD', () => {
    test('find', async () => {
      const shops = [{ name: 'French', code: 'fr' }];
      const find = jest.fn(() => Promise.resolve(shops));
      const query = jest.fn(() => ({ find }));
      global.strapi = { query };
      const params = { name_contains: 'en' };

      const shopsFound = await shopsService.find(params);
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(find).toHaveBeenCalledWith(params);
      expect(shopsFound).toMatchObject(shops);
    });

    test('findById', async () => {
      const shop = { name: 'French', code: 'fr' };
      const findOne = jest.fn(() => Promise.resolve(shop));
      const query = jest.fn(() => ({ findOne }));
      global.strapi = { query };

      const shopFound = await shopsService.findById(1);
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(findOne).toHaveBeenCalledWith({ id: 1 });
      expect(shopFound).toMatchObject(shop);
    });

    test('findByCode', async () => {
      const shop = { name: 'French', code: 'fr' };
      const findOne = jest.fn(() => Promise.resolve(shop));
      const query = jest.fn(() => ({ findOne }));
      global.strapi = { query };

      const shopFound = await shopsService.findByCode('fr');
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(findOne).toHaveBeenCalledWith({ code: 'fr' });
      expect(shopFound).toMatchObject(shop);
    });

    test('create', async () => {
      const shop = { name: 'French', code: 'fr' };
      const create = jest.fn(() => shop);
      const query = jest.fn(() => ({ create }));
      global.strapi = {
        query,
        plugins: {
          multishop: {
            services: { metrics: fakeMetricsService },
          },
        },
      };

      const createdShop = await shopsService.create(shop);
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(create).toHaveBeenCalledWith(shop);
      expect(createdShop).toMatchObject(shop);
    });

    test('update', async () => {
      const shop = { name: 'French', code: 'fr' };
      const update = jest.fn(() => shop);
      const query = jest.fn(() => ({ update }));
      global.strapi = {
        query,
        plugins: {
          multishop: {
            services: { metrics: fakeMetricsService },
          },
        },
      };

      const updatedShop = await shopsService.update({ code: 'fr' }, { name: 'French' });
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(update).toHaveBeenCalledWith({ code: 'fr' }, { name: 'French' });
      expect(updatedShop).toMatchObject(shop);
    });

    test('delete', async () => {
      const shop = { name: 'French', code: 'fr' };
      const deleteFn = jest.fn(() => shop);
      const findOne = jest.fn(() => shop);
      const isShopEnabledContentType = jest.fn(() => true);
      const query = jest.fn(() => ({ delete: deleteFn, findOne }));
      global.strapi = {
        query,
        plugins: {
          multishop: {
            services: { metrics: fakeMetricsService, 'content-types': { isShopEnabledContentType } },
          },
        },
        contentTypes: { 'application::country.country': {} },
      };

      const deletedShop = await shopsService.delete({ id: 1 });
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(deleteFn).toHaveBeenCalledWith({ id: 1 });
      expect(deletedShop).toMatchObject(shop);
    });

    test('delete - not found', async () => {
      const shop = { name: 'French', code: 'fr' };
      const deleteFn = jest.fn(() => shop);
      const findOne = jest.fn(() => undefined);
      const query = jest.fn(() => ({ delete: deleteFn, findOne }));
      global.strapi = {
        query,
        plugins: {
          multishop: {
            services: { metrics: fakeMetricsService },
          },
        },
      };

      const deletedShop = await shopsService.delete({ id: 1 });
      expect(query).toHaveBeenCalledWith('shop', 'multishop');
      expect(deleteFn).not.toHaveBeenCalled();
      expect(deletedShop).toBeUndefined();
    });
  });

  describe('initDefaultShop', () => {
    test('create default local if none exists', async () => {
      const count = jest.fn(() => Promise.resolve(0));
      const create = jest.fn(() => Promise.resolve());
      const set = jest.fn(() => Promise.resolve());

      global.strapi = {
        query: () => ({
          count,
          create,
        }),
        store: () => ({
          set,
        }),
        plugins: {
          multishop: {
            services: {
              metrics: fakeMetricsService,
            },
          },
        },
      };

      await shopsService.initDefaultShop();
      expect(count).toHaveBeenCalledWith();
      expect(create).toHaveBeenCalledWith({
        name: 'English (en)',
        code: 'en',
      });
      expect(set).toHaveBeenCalledWith({ key: 'default_shop', value: 'en' });
    });

    test('does not create default local if one already exists', async () => {
      const count = jest.fn(() => Promise.resolve(1));
      const create = jest.fn(() => Promise.resolve());
      const set = jest.fn(() => Promise.resolve());

      global.strapi = {
        query: () => ({
          count,
          create,
        }),
        store: () => ({
          set,
        }),
      };

      await shopsService.initDefaultShop();
      expect(count).toHaveBeenCalledWith();
      expect(create).not.toHaveBeenCalled();
      expect(set).not.toHaveBeenCalled();
    });
  });
});
