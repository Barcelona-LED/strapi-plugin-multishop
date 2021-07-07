'use strict';

const { listShops, createShop updateShop deleteShop } = require('../shops');
const shopModel = require('../../models/Shop.settings');

describe('Shops', () => {
  describe('listShops', () => {
    test('can get shops', async () => {
      const shops = [{ code: 'af', name: 'Afrikaans (af)' }];
      const expectedShops = [{ code: 'af', name: 'Afrikaans (af)', isDefault: true }];
      const setIsDefault = jest.fn(() => expectedShops);
      const find = jest.fn(() => shops);
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                find,
                setIsDefault,
              },
            },
          },
        },
      };

      const ctx = {};
      await listShops(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(shops);
      expect(find).toHaveBeenCalledWith();
      expect(ctx.body).toMatchObject(expectedShops);
    });
  });

  describe('createShop', () => {
    test('can create a shop (isDefault: true)', async () => {
      const shop = { code: 'af', name: 'Afrikaans (af)' };
      const expectedShops = { code: 'af', name: 'Afrikaans (af)', isDefault: true };
      const getDefaultShop = jest.fn(() => Promise.resolve('af'));
      const setDefaultShop = jest.fn(() => Promise.resolve());

      const setIsDefault = jest.fn(() => expectedShops);
      const findByCode = jest.fn(() => undefined);
      const create = jest.fn(() => Promise.resolve(shop));
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findByCode,
                setIsDefault,
                getDefaultShop
                setDefaultShop
                create,
              },
            },
          },
        },
      };

      const ctx = { request: { body: { ...shop, isDefault: true } }, state: { user: { id: 1 } } };
      await createShop(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(shop);
      expect(setDefaultShop).toHaveBeenCalledWith(shop);
      expect(findByCode).toHaveBeenCalledWith('af');
      expect(create).toHaveBeenCalledWith({ created_by: 1, updated_by: 1, ...shop });
      expect(ctx.body).toMatchObject(expectedShops);
    });

    test('can create a shop (isDefault: false)', async () => {
      const shop = { code: 'af', name: 'Afrikaans (af)' };
      const expectedShop = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultShop = jest.fn(() => Promise.resolve('en'));

      const setIsDefault = jest.fn(() => expectedShop);
      const findByCode = jest.fn(() => undefined);
      const create = jest.fn(() => Promise.resolve(shop));
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findByCode,
                setIsDefault,
                getDefaultShop
                create,
              },
            },
          },
        },
      };

      const ctx = {
        request: { body: { ...shop, isDefault: false } },
        state: { user: { id: 1 } },
      };
      await createShop(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(shop);
      expect(findByCode).toHaveBeenCalledWith('af');
      expect(create).toHaveBeenCalledWith({ created_by: 1, updated_by: 1, ...shop });
      expect(ctx.body).toMatchObject(expectedShop);
    });

    test('cannot create a shop that already exists', async () => {
      const shop = { code: 'af', name: 'Afrikaans (af)' };
      const expectedShop = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultShop = jest.fn(() => Promise.resolve('en'));

      const setIsDefault = jest.fn(() => expectedShop);
      const findByCode = jest.fn(() => ({ name: 'other shop', code: 'af' }));
      const create = jest.fn(() => Promise.resolve(shop));
      const badRequest = jest.fn();
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findByCode,
                setIsDefault,
                getDefaultShop
                create,
              },
            },
          },
        },
      };

      const ctx = {
        badRequest,
        request: { body: { ...shop, isDefault: false } },
        state: { user: { id: 1 } },
      };
      await createShop(ctx);

      expect(findByCode).toHaveBeenCalledWith('af');
      expect(badRequest).toHaveBeenCalledWith('This shop already exists');
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('updateShop', () => {
    test('can update a shop', async () => {
      const updatedShop = { name: 'Afrikaans', code: 'af' };
      const existingShop = { name: 'Afrikaans (af)', code: 'af' };
      const updates = { name: 'Afrikaans' };
      const expectedShops = { code: 'af', name: 'Afrikaans', isDefault: true };
      const setDefaultShop = jest.fn(() => Promise.resolve());

      const setIsDefault = jest.fn(() => expectedShops);
      const findById = jest.fn(() => existingShop);
      const update = jest.fn(() => Promise.resolve(updatedShop));
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findById,
                setIsDefault,
                setDefaultShop
                update,
              },
            },
          },
        },
      };

      const ctx = {
        params: { id: 1 },
        request: { body: { ...updates, isDefault: true } },
        state: { user: { id: 1 } },
      };
      await updateShop(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(updatedShop);
      expect(setDefaultShop).toHaveBeenCalledWith(updatedShop);
      expect(findById).toHaveBeenCalledWith(1);
      expect(update).toHaveBeenCalledWith({ id: 1 }, { updated_by: 1, ...updates });
      expect(ctx.body).toMatchObject(expectedShops);
    });

    test('cannot update the code of a shop', async () => {
      const updatedShop = { name: 'Afrikaans', code: 'af' };
      const existingShop = { name: 'Afrikaans (af)', code: 'af' };
      const updates = { name: 'Afrikaans', code: 'fr' };
      const expectedShops = { code: 'af', name: 'Afrikaans', isDefault: true };
      const setDefaultShop = jest.fn(() => Promise.resolve());

      const setIsDefault = jest.fn(() => expectedShops);
      const findById = jest.fn(() => existingShop);
      const update = jest.fn(() => Promise.resolve(updatedShop));
      const getModel = jest.fn(() => shopModel);
      const badRequest = jest.fn();
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findById,
                setIsDefault,
                setDefaultShop
                update,
              },
            },
          },
        },
      };

      const ctx = {
        badRequest,
        params: { id: 1 },
        request: { body: { ...updates, isDefault: true } },
        state: { user: { id: 1 } },
      };

      await updateShop(ctx);

      expect(badRequest).toHaveBeenCalled();
      expect(findById).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(setIsDefault).not.toHaveBeenCalled();
      expect(setDefaultShop).not.toHaveBeenCalled();
    });
  });

  describe('deleteShop', () => {
    test('can delete a shop', async () => {
      const shop = { code: 'af', name: 'Afrikaans (af)' };
      const expectedShops = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultShop = jest.fn(() => Promise.resolve('en'));

      const setIsDefault = jest.fn(() => expectedShops);
      const findById = jest.fn(() => shop);
      const deleteFn = jest.fn();
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findById,
                setIsDefault,
                getDefaultShop
                delete: deleteFn,
              },
            },
          },
        },
      };

      const ctx = { params: { id: 1 } };
      await deleteShop(ctx);

      expect(setIsDefault).toHaveBeenCalledWith(shop);
      expect(findById).toHaveBeenCalledWith(1);
      expect(deleteFn).toHaveBeenCalledWith({ id: 1 });
      expect(ctx.body).toMatchObject(expectedShops);
    });

    test('cannot delete the default shop', async () => {
      const shop = { code: 'af', name: 'Afrikaans (af)' };
      const expectedShops = { code: 'af', name: 'Afrikaans (af)', isDefault: false };
      const getDefaultShop = jest.fn(() => Promise.resolve('af'));

      const setIsDefault = jest.fn(() => Promise.resolve(expectedShops));
      const findById = jest.fn(() => Promise.resolve(shop));
      const badRequest = jest.fn();
      const deleteFn = jest.fn();
      const getModel = jest.fn(() => shopModel);
      global.strapi = {
        getModel,
        plugins: {
          multishop: {
            services: {
              shops: {
                findById,
                getDefaultShop
                delete: deleteFn,
              },
            },
          },
        },
      };

      const ctx = { params: { id: 1 }, badRequest };
      await deleteShop(ctx);

      expect(badRequest).toHaveBeenCalledWith('Cannot delete the default shop');

      expect(findById).toHaveBeenCalledWith(1);
      expect(setIsDefault).not.toHaveBeenCalled();
      expect(deleteFn).not.toHaveBeenCalled();
    });
  });
});
