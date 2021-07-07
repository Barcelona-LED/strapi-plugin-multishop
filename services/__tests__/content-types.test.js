'use strict';

const {
  isShopEnabledContentType,
  getValidShop,
  getNewStoresFrom,
  getAndValidateRelatedEntity,
  getNonShopEnabledAttributes,
  copyNonShopEnabledAttributes,
  fillNonShopEnabledAttributes,
} = require('../content-types');

describe('content-types service', () => {
  describe('isShopEnabledContentType', () => {
    test('Checks for the i18N option', () => {
      expect(isShopEnabledContentType({ pluginOptions: { multishop: { shopEnabled: false } } })).toBe(false);
      expect(isShopEnabledContentType({ pluginOptions: { multishop: { shopEnabled: true } } })).toBe(true);
    });

    test('Defaults to false', () => {
      expect(isShopEnabledContentType({})).toBe(false);
      expect(isShopEnabledContentType({ pluginOptions: {} })).toBe(false);
      expect(isShopEnabledContentType({ pluginOptions: { multishop: {} } })).toBe(false);
    });
  });

  describe('getNonShopEnabledAttributes', () => {
    test('Uses the pluginOptions to detect non shopEnabled fields', () => {
      expect(
        getNonShopEnabledAttributes({
          uid: 'test-model',
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
            price: {
              type: 'integer',
            },
          },
        })
      ).toEqual(['stars', 'price']);
    });

    test('Consider relations to be always shopEnabled', () => {
      expect(
        getNonShopEnabledAttributes({
          uid: 'test-model',
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
            price: {
              type: 'integer',
            },
            relation: {
              model: 'user',
            },
            secondRelation: {
              collection: 'user',
            },
          },
        })
      ).toEqual(['stars', 'price']);
    });

    test('Consider shop, stores & published_at as shopEnabled', () => {
      expect(
        getNonShopEnabledAttributes({
          uid: 'test-model',
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
            price: {
              type: 'integer',
            },
            shop: {
              type: 'string',
              visible: false,
            },
            stores: {
              collection: 'test-model',
              visible: false,
            },
            published_at: {
              type: 'datetime',
              visible: false,
            },
          },
        })
      ).toEqual(['stars', 'price']);
    });

    test('Consider uid to always be shopEnabled', () => {
      expect(
        getNonShopEnabledAttributes({
          attributes: {
            price: {
              type: 'integer',
            },
            slug: {
              type: 'uid',
            },
          },
        })
      ).toEqual(['price']);
    });
  });

  describe('getValidShop', () => {
    test('set default shop if the provided one is nil', async () => {
      const getDefaultShop = jest.fn(() => Promise.resolve('en'));
      global.strapi = {
        plugins: {
          multishop: {
            services: {
              shops: {
                getDefaultShop,
              },
            },
          },
        },
      };
      const shop = await getValidShop(null);

      expect(shop).toBe('en');
    });

    test('set shop to the provided one if it exists', async () => {
      const findByCode = jest.fn(() => Promise.resolve('en'));
      global.strapi = {
        plugins: {
          multishop: {
            services: {
              shops: {
                findByCode,
              },
            },
          },
        },
      };
      const shop = await getValidShop('en');

      expect(shop).toBe('en');
    });

    test("throw if provided shop doesn't exist", async () => {
      const findByCode = jest.fn(() => Promise.resolve(undefined));
      global.strapi = {
        plugins: {
          multishop: {
            services: {
              shops: {
                findByCode,
              },
            },
          },
        },
      };
      try {
        await getValidShop('en');
      } catch (e) {
        expect(e.message).toBe('Shop not found');
      }

      expect(findByCode).toHaveBeenCalledWith('en');
      expect.assertions(2);
    });
  });

  describe.each([['singleType'], ['collectionType']])('getAndValidateRelatedEntity - %s', kind => {
    test("Throw if relatedEntity is provided but doesn't exist", async () => {
      const findOne = jest.fn(() => Promise.resolve(undefined));
      const relatedEntityId = 1;
      const model = 'application::country.country';
      const shop = 'fr';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      try {
        await getAndValidateRelatedEntity(relatedEntityId, model, shop);
      } catch (e) {
        expect(e.message).toBe("The related entity doesn't exist");
      }

      expect(findOne).toHaveBeenCalledWith(kind === 'singleType' ? {} : { id: relatedEntityId });
      expect.assertions(2);
    });

    test('Throw if shop already exists (1/2)', async () => {
      const relatedEntityId = 1;
      const relatedEntity = {
        id: relatedEntityId,
        shop: 'en',
        stores: [],
      };
      const findOne = jest.fn(() => Promise.resolve(relatedEntity));
      const model = 'application::country.country';
      const shop = 'en';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      try {
        await getAndValidateRelatedEntity(relatedEntityId, model, shop);
      } catch (e) {
        expect(e.message).toBe('The entity already exists in this shop');
      }

      expect(findOne).toHaveBeenCalledWith(kind === 'singleType' ? {} : { id: relatedEntityId });
      expect.assertions(2);
    });

    test('Throw if shop already exists (2/2)', async () => {
      const relatedEntityId = 1;
      const relatedEntity = {
        id: relatedEntityId,
        shop: 'fr',
        stores: [
          {
            id: 2,
            shop: 'en',
          },
        ],
      };
      const findOne = jest.fn(() => Promise.resolve(relatedEntity));
      const model = 'application::country.country';
      const shop = 'en';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      try {
        await getAndValidateRelatedEntity(relatedEntityId, model, shop);
      } catch (e) {
        expect(e.message).toBe('The entity already exists in this shop');
      }

      expect(findOne).toHaveBeenCalledWith(kind === 'singleType' ? {} : { id: relatedEntityId });
      expect.assertions(2);
    });

    test('get related entity', async () => {
      const relatedEntityId = 1;
      const relatedEntity = {
        id: relatedEntityId,
        shop: 'fr',
        stores: [
          {
            id: 2,
            shop: 'en',
          },
        ],
      };
      const findOne = jest.fn(() => Promise.resolve(relatedEntity));
      const model = 'application::country.country';
      const shop = 'it';

      global.strapi = {
        query: () => ({
          findOne,
        }),
        getModel: () => ({ kind }),
      };

      const foundEntity = await getAndValidateRelatedEntity(relatedEntityId, model, shop);

      expect(foundEntity).toEqual(relatedEntity);
      expect(findOne).toHaveBeenCalledWith(kind === 'singleType' ? {} : { id: relatedEntityId });
      expect.assertions(2);
    });
  });

  describe('getNewStoresFrom', () => {
    test('Can get stores', async () => {
      const relatedEntity = {
        id: 1,
        shop: 'fr',
        stores: [
          {
            id: 2,
            shop: 'en',
          },
          {
            id: 3,
            shop: 'it',
          },
        ],
      };

      const stores = await getNewStoresFrom(relatedEntity);

      expect(stores).toEqual([1, 2, 3]);
    });

    test('Add empty stores if none exist (CT)', async () => {
      const stores = await getNewStoresFrom(undefined);

      expect(stores).toEqual([]);
    });
  });

  describe('copyNonShopEnabledAttributes', () => {
    test('Does not copy shop, stores & published_at', () => {
      const model = {
        attributes: {
          title: {
            type: 'string',
            pluginOptions: {
              multishop: { shopEnabled: true },
            },
          },
          price: {
            type: 'integer',
          },
          relation: {
            model: 'user',
          },
          description: {
            type: 'string',
          },
          shop: {
            type: 'string',
            visible: false,
          },
          stores: {
            collection: 'test-model',
            visible: false,
          },
          published_at: {
            type: 'datetime',
            visible: false,
          },
        },
      };

      const input = {
        id: 1,
        title: 'My custom title',
        price: 25,
        relation: 1,
        description: 'My super description',
        shop: 'en',
        stores: [1, 2, 3],
        published_at: '2021-03-18T09:47:37.557Z',
      };

      const result = copyNonShopEnabledAttributes(model, input);
      expect(result).toStrictEqual({
        price: input.price,
        description: input.description,
      });
    });

    test('picks only non shopEnabled attributes', () => {
      const model = {
        attributes: {
          title: {
            type: 'string',
            pluginOptions: {
              multishop: { shopEnabled: true },
            },
          },
          price: {
            type: 'integer',
          },
          relation: {
            model: 'user',
          },
          description: {
            type: 'string',
          },
        },
      };

      const input = {
        id: 1,
        title: 'My custom title',
        price: 25,
        relation: 1,
        description: 'My super description',
      };

      const result = copyNonShopEnabledAttributes(model, input);
      expect(result).toStrictEqual({
        price: input.price,
        description: input.description,
      });
    });

    test('Removes ids', () => {
      const compoModel = {
        attributes: {
          name: { type: 'string' },
        },
      };

      global.strapi = {
        db: {
          getModelsByAttribute: jest.fn(() => [compoModel]),
        },
      };

      const model = {
        attributes: {
          title: {
            type: 'string',
            pluginOptions: {
              multishop: { shopEnabled: true },
            },
          },
          price: {
            type: 'integer',
          },
          relation: {
            model: 'user',
          },
          component: {
            type: 'component',
            component: 'compo',
          },
        },
      };

      const input = {
        id: 1,
        title: 'My custom title',
        price: 25,
        relation: 1,
        component: {
          id: 2,
          name: 'Hello',
        },
      };

      const result = copyNonShopEnabledAttributes(model, input);
      expect(result).toEqual({
        price: 25,
        component: {
          name: 'Hello',
        },
      });
    });
  });

  describe('fillNonShopEnabledAttributes', () => {
    test('fill non shopEnabled attributes', () => {
      const entry = {
        a: 'a',
        b: undefined,
        c: null,
        d: 1,
        e: {},
        la: 'a',
        lb: undefined,
        lc: null,
        ld: 1,
        le: {},
      };

      const relatedEntry = {
        a: 'a',
        b: 'b',
        c: 'c',
        d: 'd',
        e: 'e',
        la: 'la',
        lb: 'lb',
        lc: 'lc',
        ld: 'ld',
        le: 'le',
      };

      const modelDef = {
        attributes: {
          a: {},
          b: {},
          c: {},
          d: {},
          e: {},
          la: { pluginOptions: { multishop: { shopEnabled: true } } },
          lb: { pluginOptions: { multishop: { shopEnabled: true } } },
          lc: { pluginOptions: { multishop: { shopEnabled: true } } },
          ld: { pluginOptions: { multishop: { shopEnabled: true } } },
          le: { pluginOptions: { multishop: { shopEnabled: true } } },
        },
      };

      const getModel = jest.fn(() => modelDef);
      global.strapi = { getModel };

      fillNonShopEnabledAttributes(entry, relatedEntry, { model: 'model' });

      expect(entry).toEqual({
        a: 'a',
        b: 'b',
        c: 'c',
        d: 1,
        e: {},
        la: 'a',
        lb: undefined,
        lc: null,
        ld: 1,
        le: {},
      });
    });
  });
});
