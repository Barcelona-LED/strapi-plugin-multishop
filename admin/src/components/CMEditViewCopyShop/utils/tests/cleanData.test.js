import cleanData from '../cleanData';

describe('multishop | Components | CMEditViewCopyShop | utils', () => {
  describe('cleanData', () => {
    it('should change the store key with the one passed in the argument', () => {
      const data = {
        address: 'test',
        addresseses: [],
        common: 'common',
        created_at: '2021-03-17T15:34:05.866Z',
        created_by: {
          blocked: null,
          email: 'cyril@strapi.io',
          firstname: 'cyril',
          id: 1,
          isActive: true,
          lastname: 'lopez',
          preferedLanguage: null,
          registrationToken: null,
          resetPasswordToken: null,
          username: null,
        },
        id: 14,
        shop: 'fr-FR',
        stores: [
          {
            id: 13,
            shop: 'en',
            published_at: null,
          },
        ],
        name: 'name',
        published_at: null,
        updated_at: '2021-03-17T15:34:18.958Z',
        updated_by: {
          blocked: null,
          email: 'cyril@strapi.io',
          firstname: 'cyril',
          id: 1,
          isActive: true,
          lastname: 'lopez',
          preferedLanguage: null,
          registrationToken: null,
          resetPasswordToken: null,
          username: null,
        },
      };
      const contentType = {
        attributes: {
          address: { type: 'relation' },
          addresseses: { type: 'relation' },
          common: { pluginOptions: { multishop: { shopEnabled: true } }, type: 'text' },
          created_at: { type: 'timestamp' },
          id: { type: 'integer' },
          name: { pluginOptions: { multishop: { shopEnabled: true } } },
          updated_at: { type: 'timestamp' },
        },
      };
      const initStores = [
        {
          id: 14,
          shop: 'fr-FR',
          published_at: null,
        },
      ];

      const expected = {
        common: 'common',
        shop: 'fr-FR',
        stores: [
          {
            id: 14,
            shop: 'fr-FR',
            published_at: null,
          },
        ],
        name: 'name',
      };

      expect(cleanData(data, { contentType, components: {} }, initStores)).toEqual(expected);
    });
  });
});
