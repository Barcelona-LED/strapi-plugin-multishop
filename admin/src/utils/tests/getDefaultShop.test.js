import getDefaultShop from '../getDefaultShop';

describe('getDefaultShop', () => {
  it('gives fr-FR when it s the default shop and that it has read access to it', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
    ];

    const ctPermissions = {
      'plugins::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugins::content-manager.explorer.create',
          subject: 'application::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            shops: [],
          },
          conditions: [],
        },
      ],
      'plugins::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugins::content-manager.explorer.read',
          subject: 'application::address.address',
          properties: {
            fields: [],
            shops: ['en', 'fr-FR'],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'fr-FR';
    const actual = getDefaultShop(ctPermissions, shops);

    expect(actual).toEqual(expected);
  });

  it('gives fr-FR when it s the default shop and that it has create access to it', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
    ];

    const ctPermissions = {
      'plugins::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugins::content-manager.explorer.create',
          subject: 'application::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            shops: ['fr-FR'],
          },
          conditions: [],
        },
      ],
      'plugins::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugins::content-manager.explorer.read',
          subject: 'application::address.address',
          properties: {
            fields: [],
            shops: ['en'],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'fr-FR';
    const actual = getDefaultShop(ctPermissions, shops);

    expect(actual).toEqual(expected);
  });

  it('gives gives the first shop with read permission ("en") when the shop is allowed', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Another lang',
        code: 'de',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const ctPermissions = {
      'plugins::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugins::content-manager.explorer.create',
          subject: 'application::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            shops: [],
          },
          conditions: [],
        },
      ],
      'plugins::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugins::content-manager.explorer.read',
          subject: 'application::address.address',
          properties: {
            fields: [],
            shops: ['en', 'de'],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'en';
    const actual = getDefaultShop(ctPermissions, shops);

    expect(actual).toEqual(expected);
  });

  it('gives gives the first shop with create permission ("en") when the shop is allowed', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Another lang',
        code: 'de',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const ctPermissions = {
      'plugins::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugins::content-manager.explorer.create',
          subject: 'application::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            shops: ['en', 'de'],
          },
          conditions: [],
        },
      ],
      'plugins::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugins::content-manager.explorer.read',
          subject: 'application::address.address',
          properties: {
            fields: [],
            shops: [],
          },
          conditions: [],
        },
      ],
    };

    const expected = 'en';
    const actual = getDefaultShop(ctPermissions, shops);

    expect(actual).toEqual(expected);
  });

  it('gives null when the user has no permission on any shop', () => {
    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: false,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: true,
      },
      {
        id: 3,
        name: 'Another lang',
        code: 'de',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-17T13:01:03.569Z',
        isDefault: false,
      },
    ];

    const ctPermissions = {
      'plugins::content-manager.explorer.create': [
        {
          id: 1325,
          action: 'plugins::content-manager.explorer.create',
          subject: 'application::address.address',
          properties: {
            fields: [
              'postal_coder',
              'categories',
              'cover',
              'images',
              'city',
              'likes',
              'json',
              'slug',
            ],
            shops: [],
          },
          conditions: [],
        },
      ],
      'plugins::content-manager.explorer.read': [
        {
          id: 1326,
          action: 'plugins::content-manager.explorer.read',
          subject: 'application::address.address',
          properties: {
            fields: [],
            shops: [],
          },
          conditions: [],
        },
      ],
    };

    const expected = null;
    const actual = getDefaultShop(ctPermissions, shops);

    expect(actual).toEqual(expected);
  });
});
