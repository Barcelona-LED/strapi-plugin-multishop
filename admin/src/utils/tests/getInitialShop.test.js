import getInitialShop from '../getInitialShop';

describe('getInitialShop', () => {
  it('gives "fr-FR" when the query.plugins.shop is "fr-FR"', () => {
    const query = {
      page: '1',
      pageSize: '10',
      _sort: 'Name:ASC',
      plugins: {
        multishop: { shop: 'fr-FR' },
      },
    };

    const shops = [
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: true,
      },
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-09T15:03:06.996Z',
        isDefault: false,
      },
    ];

    const expected = {
      id: 2,
      name: 'French (France) (fr-FR)',
      code: 'fr-FR',
      created_at: '2021-03-09T15:03:06.992Z',
      updated_at: '2021-03-09T15:03:06.996Z',
      isDefault: false,
    };
    const actual = getInitialShop(query, shops);

    expect(actual).toEqual(expected);
  });

  it('gives the default shop ("en") when there s no shop in the query', () => {
    const query = {
      page: '1',
      pageSize: '10',
      _sort: 'Name:ASC',
      plugins: {
        something: 'great',
      },
    };

    const shops = [
      {
        id: 2,
        name: 'French (France) (fr-FR)',
        code: 'fr-FR',
        created_at: '2021-03-09T15:03:06.992Z',
        updated_at: '2021-03-09T15:03:06.996Z',
        isDefault: false,
      },
      {
        id: 1,
        name: 'English',
        code: 'en',
        created_at: '2021-03-09T14:57:03.016Z',
        updated_at: '2021-03-09T14:57:03.016Z',
        isDefault: true,
      },
    ];

    const expected = {
      id: 1,
      name: 'English',
      code: 'en',
      created_at: '2021-03-09T14:57:03.016Z',
      updated_at: '2021-03-09T14:57:03.016Z',
      isDefault: true,
    };

    const actual = getInitialShop(query, shops);

    expect(actual).toEqual(expected);
  });

  it('gives "undefined" when theres no shop. IMPORTANT: such case should not exist since at least one shop is created on the backend when plug-in multishop', () => {
    const query = {
      page: '1',
      pageSize: '10',
      _sort: 'Name:ASC',
      plugins: {
        something: 'great',
      },
    };

    const shops = [];

    const expected = undefined;
    const actual = getInitialShop(query, shops);

    expect(actual).toEqual(expected);
  });
});
