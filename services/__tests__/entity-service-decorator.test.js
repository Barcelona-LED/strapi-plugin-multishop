'use strict';

jest.mock('../stores', () => {
  return {
    syncStores: jest.fn(async () => {}),
    syncNonShopEnabledAttributes: jest.fn(async () => {}),
  };
});

const { decorator } = require('../entity-service-decorator');
const { syncStores, syncNonShopEnabledAttributes } = require('../stores');
const shops = require('../shops');
const contentTypes = require('../content-types');

const model = {
  pluginOptions: {
    multishop: {
      shopEnabled: true,
    },
  },
};

const nonShopEnabledModel = {
  pluginOptions: {
    multishop: {
      shopEnabled: false,
    },
  },
};

const models = {
  'test-model': model,
  'non-shopEnabled-model': nonShopEnabledModel,
};

describe('Entity service decorator', () => {
  beforeAll(() => {
    global.strapi = {
      plugins: {
        multishop: {
          services: {
            shops,
            'content-types': contentTypes,
          },
        },
      },
      query() {
        return {
          create() {},
          update() {},
        };
      },
      db: {
        getModel(uid) {
          return models[uid || 'test-model'];
        },
      },
      store: () => ({ get: () => 'en' }),
    };
  });

  beforeEach(() => {
    syncStores.mockClear();
    syncNonShopEnabledAttributes.mockClear();
  });

  describe('wrapOptions', () => {
    test('Calls original wrapOptions', async () => {
      const defaultService = {
        wrapOptions: jest.fn(() => Promise.resolve('li')),
      };

      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      await service.wrapOptions(input, { model: 'test-model' });

      expect(defaultService.wrapOptions).toHaveBeenCalledWith(input, { model: 'test-model' });
    });

    test('Does not wrap options if model is not shopEnabled', async () => {
      const defaultService = {
        wrapOptions: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      const output = await service.wrapOptions(input, { model: 'non-shopEnabled-model' });

      expect(output).toStrictEqual(input);
    });

    test('does not change non params options', async () => {
      const defaultService = {
        wrapOptions: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      const output = await service.wrapOptions(input, { model: 'test-model' });

      expect(output.populate).toStrictEqual(input.populate);
    });

    test('Adds shop param', async () => {
      const defaultService = {
        wrapOptions: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = { populate: ['test'] };
      const output = await service.wrapOptions(input, { model: 'test-model' });

      expect(output).toMatchObject({ params: { shop: 'en' } });
    });

    const testData = [
      ['findOne', { id: 1 }],
      ['update', { id: 1 }],
      ['delete', { id: 1 }],
      ['delete', { id_in: [1] }],
      ['findOne', { _where: { id: 1 } }],
      ['update', { _where: { id: 1 } }],
      ['delete', { _where: { id: 1 } }],
      ['delete', { _where: { id_in: [1] } }],
      ['findOne', { _where: [{ id: 1 }] }],
      ['update', { _where: [{ id: 1 }] }],
      ['delete', { _where: [{ id: 1 }] }],
      ['delete', { _where: [{ id_in: [1] }] }],
    ];

    test.each(testData)(
      "Doesn't add shop param when the params contain id or id_in - %s",
      async (action, params) => {
        const defaultService = {
          wrapOptions: jest.fn(opts => Promise.resolve(opts)),
        };
        const service = decorator(defaultService);

        const input = Object.assign({ populate: ['test'], params });
        const output = await service.wrapOptions(input, { model: 'test-model', action });

        expect(output).toEqual({ populate: ['test'], params });
      }
    );

    test('Replaces _shop param', async () => {
      const defaultService = {
        wrapOptions: jest.fn(opts => Promise.resolve(opts)),
      };
      const service = decorator(defaultService);

      const input = {
        params: {
          _shop: 'fr',
        },
        populate: ['test'],
      };
      const output = await service.wrapOptions(input, { model: 'test-model' });

      expect(output).toMatchObject({ params: { shop: 'fr' } });
    });
  });

  describe('create', () => {
    test('Calls original create', async () => {
      const entry = {
        id: 1,
      };

      const defaultService = {
        create: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      await service.create(input, { model: 'test-model' });

      expect(defaultService.create).toHaveBeenCalledWith(input, { model: 'test-model' });
    });

    test('Calls syncStores if model is shopEnabled', async () => {
      const entry = {
        id: 1,
        stores: [{ id: 2 }],
      };

      const defaultService = {
        create: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      await service.create(input, { model: 'test-model' });

      expect(defaultService.create).toHaveBeenCalledWith(input, { model: 'test-model' });
      expect(syncStores).toHaveBeenCalledWith(entry, { model });
    });

    test('Skip processing if model is not shopEnabled', async () => {
      const entry = {
        id: 1,
        stores: [{ id: 2 }],
      };

      const defaultService = {
        create: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { data: { title: 'title ' } };
      const output = await service.create(input, { model: 'non-shopEnabled-model' });

      expect(defaultService.create).toHaveBeenCalledWith(input, { model: 'non-shopEnabled-model' });
      expect(syncStores).not.toHaveBeenCalled();
      expect(output).toStrictEqual(entry);
    });
  });

  describe('update', () => {
    test('Calls original update', async () => {
      const entry = {
        id: 1,
      };

      const defaultService = {
        update: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { params: { id: 1 }, data: { title: 'title ' } };
      await service.update(input, { model: 'test-model' });

      expect(defaultService.update).toHaveBeenCalledWith(input, { model: 'test-model' });
    });

    test('Calls syncNonShopEnabledAttributes if model is shopEnabled', async () => {
      const entry = {
        id: 1,
        stores: [{ id: 2 }],
      };

      const defaultService = {
        update: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { params: { id: 1 }, data: { title: 'title ' } };
      const output = await service.update(input, { model: 'test-model' });

      expect(defaultService.update).toHaveBeenCalledWith(input, { model: 'test-model' });
      expect(syncNonShopEnabledAttributes).toHaveBeenCalledWith(entry, { model });
      expect(output).toStrictEqual(entry);
    });

    test('Skip processing if model is not shopEnabled', async () => {
      const entry = {
        id: 1,
        stores: [{ id: 2 }],
      };

      const defaultService = {
        update: jest.fn(() => Promise.resolve(entry)),
      };

      const service = decorator(defaultService);

      const input = { params: { id: 1 }, data: { title: 'title ' } };
      await service.update(input, { model: 'non-shopEnabled-model' });

      expect(defaultService.update).toHaveBeenCalledWith(input, { model: 'non-shopEnabled-model' });
      expect(syncNonShopEnabledAttributes).not.toHaveBeenCalled();
    });
  });
});
