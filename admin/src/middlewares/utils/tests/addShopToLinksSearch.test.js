import addShopToLinksSearch from '../addShopToLinksSearch';

describe('multishop | middlewares | utils | addShopToLinksSearch', () => {
  it('should return an array', () => {
    expect(addShopToLinksSearch([])).toEqual([]);
  });

  it('should not modify the links when multishop is not enabled on a content type', () => {
    const links = [{ uid: 'test', destination: 'cm/collectionType/test' }];
    const schemas = [{ uid: 'test', pluginOptions: { multishop: { shopEnabled: false } } }];

    expect(addShopToLinksSearch(links, 'collectionType', schemas)).toEqual(links);
  });

  it('should set the isDisplayed key to false when the user does not have the permission to read or create a shop on a collection type', () => {
    const links = [
      { uid: 'foo', destination: 'cm/collectionType/foo', isDisplayed: true },
      { uid: 'bar', destination: 'cm/collectionType/bar', isDisplayed: true },
    ];
    const schemas = [
      { uid: 'foo', pluginOptions: { multishop: { shopEnabled: true } } },
      { uid: 'bar', pluginOptions: { multishop: { shopEnabled: true } } },
    ];
    const permissions = {
      foo: {
        'plugins::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
            },
          },
        ],
        'plugins::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
            },
          },
        ],
      },
      bar: {
        'plugins::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
              shops: [],
            },
          },
        ],
        'plugins::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
              shops: [],
            },
          },
        ],
      },
    };
    const expected = [
      { uid: 'foo', destination: 'cm/collectionType/foo', isDisplayed: false },
      { uid: 'bar', destination: 'cm/collectionType/bar', isDisplayed: false },
    ];
    const shops = [{ code: 'en', isDefault: true }, { code: 'fr' }];

    expect(addShopToLinksSearch(links, 'collectionType', schemas, shops, permissions)).toEqual(
      expected
    );
  });

  it('should add the shop to a link search', () => {
    const links = [
      { uid: 'foo', destination: 'cm/collectionType/foo', isDisplayed: true, search: 'page=1' },
      { uid: 'bar', destination: 'cm/collectionType/bar', isDisplayed: true },
    ];
    const schemas = [
      { uid: 'foo', pluginOptions: { multishop: { shopEnabled: true } } },
      { uid: 'bar', pluginOptions: { multishop: { shopEnabled: true } } },
    ];
    const permissions = {
      foo: {
        'plugins::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
              shops: ['fr'],
            },
          },
        ],
        'plugins::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
            },
          },
        ],
      },
      bar: {
        'plugins::content-manager.explorer.create': [
          {
            properties: {
              fields: ['name'],
              shops: ['fr'],
            },
          },
        ],
        'plugins::content-manager.explorer.read': [
          {
            properties: {
              fields: ['name'],
              shops: ['en'],
            },
          },
        ],
      },
    };
    const expected = [
      {
        uid: 'foo',
        destination: 'cm/collectionType/foo',
        isDisplayed: true,
        search: 'page=1&plugins[multishop][shop]=fr',
      },
      {
        uid: 'bar',
        destination: 'cm/collectionType/bar',
        isDisplayed: true,
        search: 'plugins[multishop][shop]=en',
      },
    ];
    const shops = [{ code: 'en', isDefault: true }, { code: 'fr' }];

    expect(addShopToLinksSearch(links, 'collectionType', schemas, shops, permissions)).toEqual(
      expected
    );
  });
});
